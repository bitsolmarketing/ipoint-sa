<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Settings;
use App\Support\ThemePalette;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Admin → Appearance. Edits the storefront colour palette (App\Support\ThemePalette)
 * without a deploy. Values are plain hex strings keyed by palette token.
 */
class AdminAppearanceController extends Controller
{
    /**
     * Ready-made palettes offered as one-click starting points. Any token left
     * out of a preset keeps its default, so a preset only has to state what it
     * actually changes.
     */
    private const PRESETS = [
        [
            'key' => 'default',
            'name' => 'iPoint Blue',
            'description' => 'The stock palette.',
            'colors' => [],
        ],
        [
            'key' => 'midnight',
            'name' => 'Midnight',
            'description' => 'Deep navy primary on a cooler canvas.',
            'colors' => [
                'brand' => '#1B3A8C', 'brand_hover' => '#2A4FB0', 'brand_tint' => '#EEF2FC',
                'brand_tint_alt' => '#E4EAF8', 'accent' => '#5B8BF5',
                'heading' => '#12172B', 'page' => '#F4F5F9', 'page_dark' => '#0E1120',
                'surface_dark' => '#181C2E', 'surface_dark_alt' => '#232840',
                'banner_bg' => '#F4F5F9', 'banner_text' => '#12172B',
                'banner_button' => '#1B3A8C', 'banner_dot' => '#1B3A8C',
            ],
        ],
        [
            'key' => 'graphite',
            'name' => 'Graphite',
            'description' => 'Monochrome, product-photography friendly.',
            'colors' => [
                'brand' => '#2C2C2E', 'brand_hover' => '#48484A', 'brand_tint' => '#F2F2F4',
                'brand_tint_alt' => '#EAEAEC', 'accent' => '#8E8E93',
                'heading' => '#111113', 'page' => '#FAFAFA', 'page_dark' => '#0C0C0D',
                'banner_bg' => '#FAFAFA', 'banner_text' => '#111113',
                'banner_button' => '#2C2C2E', 'banner_dot' => '#2C2C2E',
            ],
        ],
        [
            'key' => 'emerald',
            'name' => 'Emerald',
            'description' => 'Green primary — pairs with the trade-in range.',
            'colors' => [
                'brand' => '#046C4E', 'brand_hover' => '#057A57', 'brand_tint' => '#EAF7F1',
                'brand_tint_alt' => '#DFF3EA', 'accent' => '#34D399',
                'heading' => '#0B1F19', 'page' => '#F4F8F6', 'page_dark' => '#0B1512',
                'surface_dark' => '#13211C', 'surface_dark_alt' => '#1D2F28',
                'banner_bg' => '#F4F8F6', 'banner_text' => '#0B1F19',
                'banner_button' => '#046C4E', 'banner_dot' => '#046C4E',
            ],
        ],
        [
            'key' => 'sunset',
            'name' => 'Sunset',
            'description' => 'Warm orange primary for promotional seasons.',
            'colors' => [
                'brand' => '#D2571C', 'brand_hover' => '#E8683A', 'brand_tint' => '#FDF1EA',
                'brand_tint_alt' => '#FBE7DA', 'accent' => '#FF9F6B',
                'heading' => '#231309', 'page' => '#FAF7F5', 'page_dark' => '#17100C',
                'surface_dark' => '#211711', 'surface_dark_alt' => '#2F211A',
                'banner_bg' => '#FAF7F5', 'banner_text' => '#231309',
                'banner_button' => '#D2571C', 'banner_dot' => '#D2571C',
            ],
        ],
    ];

    public function index()
    {
        return Inertia::render('Admin/Appearance/Index', [
            // The registry drives the whole form, so adding a token in PHP makes
            // it appear in the admin UI with no JSX change.
            'tokenGroups' => collect(ThemePalette::TOKENS)->map(
                fn (array $tokens) => collect($tokens)->map(fn (array $meta, string $key) => [
                    'key' => $key,
                    'label' => $meta[0],
                    'default' => $meta[1],
                    'hint' => $meta[2],
                ])->values()
            ),
            'palette' => ThemePalette::current(),
            'defaults' => ThemePalette::defaults(),
            'presets' => self::PRESETS,
        ]);
    }

    public function update(Request $request)
    {
        $tokens = array_keys(ThemePalette::defaults());

        // Every token must be a 6-digit hex. Anything else is rejected outright
        // rather than silently coerced, so the admin sees what went wrong.
        $rules = [];
        foreach ($tokens as $token) {
            $rules['colors.' . $token] = ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'];
        }

        $request->validate($rules, array_reduce($tokens, function (array $messages, string $token) {
            $messages['colors.' . $token . '.regex'] = 'Use a 6-digit hex colour such as #0066CC.';

            return $messages;
        }, []));

        $colors = $request->input('colors');
        $defaults = ThemePalette::defaults();

        // Store only what differs from the code default — a site left on the
        // stock palette keeps an empty settings group and so picks up future
        // default changes automatically. Rewriting the group wholesale also
        // clears out tokens that have just been returned to their default.
        $overrides = [];
        foreach ($tokens as $token) {
            $value = strtoupper($colors[$token]);

            if ($value !== strtoupper($defaults[$token])) {
                $overrides[$token] = $value;
            }
        }

        Settings::forgetGroup('theme');
        Settings::putMany('theme', $overrides);

        return redirect()->route('admin.appearance.index')->with('success', 'Colour palette saved. The storefront is updated.');
    }

    /**
     * Drop every override, returning the storefront to the stock palette.
     */
    public function reset()
    {
        Settings::forgetGroup('theme');

        return redirect()->route('admin.appearance.index')->with('success', 'Palette reset to the default colours.');
    }
}
