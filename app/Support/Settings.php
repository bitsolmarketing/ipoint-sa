<?php

namespace App\Support;

use App\Models\SiteSetting;

/**
 * Thin read/write facade over the `site_settings` table.
 *
 * Values are JSON-encoded on the way in and decoded on the way out, so a
 * setting can be a string, number, bool or nested array. Reads are memoised per
 * group for the life of the request (one query per group, no cache store to go
 * stale on shared hosting), and every read is wrapped in rescue() so the app
 * still boots if the table has not been migrated yet.
 */
class Settings
{
    /** @var array<string, array<string, mixed>> group => [key => value] */
    private static array $memo = [];

    /**
     * All settings in a group, merged over the supplied defaults.
     *
     * @param  array<string, mixed>  $defaults
     * @return array<string, mixed>
     */
    public static function group(string $group, array $defaults = []): array
    {
        if (! array_key_exists($group, self::$memo)) {
            self::$memo[$group] = rescue(
                fn () => SiteSetting::where('group', $group)
                    ->get()
                    ->mapWithKeys(fn (SiteSetting $row) => [$row->key => json_decode($row->value, true)])
                    ->all(),
                [],
                false
            );
        }

        // Only keys the caller knows about survive, so a stale row left behind by
        // a renamed setting can never leak into the palette/config it feeds.
        $stored = array_filter(
            self::$memo[$group],
            fn ($value, $key) => $value !== null && ($defaults === [] || array_key_exists($key, $defaults)),
            ARRAY_FILTER_USE_BOTH
        );

        return array_merge($defaults, $stored);
    }

    /**
     * A single setting, or $default when unset.
     */
    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        $values = self::group($group);

        return $values[$key] ?? $default;
    }

    /**
     * Write one setting and drop the group's memo.
     */
    public static function put(string $group, string $key, mixed $value): void
    {
        SiteSetting::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => self::encode($value)]
        );

        unset(self::$memo[$group]);
    }

    /**
     * Write many settings in one go.
     *
     * @param  array<string, mixed>  $values
     */
    public static function putMany(string $group, array $values): void
    {
        foreach ($values as $key => $value) {
            SiteSetting::updateOrCreate(
                ['group' => $group, 'key' => $key],
                ['value' => self::encode($value)]
            );
        }

        unset(self::$memo[$group]);
    }

    /**
     * JSON-encode a value for storage.
     *
     * Plain json_encode() returns false the moment any string in the value
     * contains malformed UTF-8 — a paste from Word or a mangled dash is enough.
     * Eloquent would then write that false as "0", silently throwing the
     * setting away. Substituting the bad bytes keeps the rest of the value, and
     * an encode that still fails throws rather than persisting nonsense.
     */
    private static function encode(mixed $value): string
    {
        $json = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

        if ($json === false) {
            throw new \RuntimeException('Could not encode setting value: ' . json_last_error_msg());
        }

        return $json;
    }

    /**
     * Delete every stored value in a group, reverting it to code defaults.
     */
    public static function forgetGroup(string $group): void
    {
        SiteSetting::where('group', $group)->delete();

        unset(self::$memo[$group]);
    }
}
