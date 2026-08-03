<?php

namespace App\Support;

/**
 * The storefront colour palette.
 *
 * Every token here is exposed to Tailwind as a real colour (see the `colors`
 * block in tailwind.config.js), so `text-brand`, `bg-surface`, `ring-brand/20`
 * and friends all work — including opacity modifiers, which is why the CSS
 * custom properties hold space-separated RGB channels rather than hex.
 *
 * Defaults below are the values that were hard-coded across the storefront JSX
 * before the palette existed, so an un-configured site looks exactly as it did.
 *
 * Scoping: defaults are emitted on :root, admin overrides on `.storefront-theme`
 * (the wrapper StorefrontLayout renders). The admin panel therefore keeps the
 * stock palette no matter what the storefront is set to, and can never be made
 * unreadable from the appearance screen.
 */
class ThemePalette
{
    /**
     * group => [ token => [label, default, hint] ]
     *
     * Token keys are persisted in site_settings, so never rename one without a
     * migration — an unknown key is ignored and silently falls back to default.
     */
    public const TOKENS = [
        'Brand' => [
            'brand'          => ['Primary',            '#0066CC', 'Buttons, links and active states across the site'],
            'brand_hover'    => ['Primary hover',      '#0077ED', 'Hover/pressed state for primary buttons'],
            'brand_tint'     => ['Soft brand tint',    '#F0F7FF', 'Pale blue panels and highlight rows'],
            'brand_tint_alt' => ['Soft brand tint 2',  '#EAF2FF', 'Second pale tint used on filter chips'],
            'accent'         => ['Bright accent',      '#2997FF', 'Glow accents on dark sections'],
        ],

        'Text' => [
            'heading' => ['Headings',      '#1D1D1F', 'Product names, section titles, primary copy'],
            'body'    => ['Body text',     '#4B5563', 'Paragraph copy'],
            'muted'   => ['Muted text',    '#6B7280', 'Secondary labels and captions'],
            'subtle'  => ['Subtle text',   '#9CA3AF', 'Helper text, placeholders, meta rows'],
        ],

        'Surfaces' => [
            'page'             => ['Page background',        '#F5F5F7', 'The canvas behind every page'],
            'page_dark'        => ['Page background (dark)', '#151516', 'Canvas when the visitor is in dark mode'],
            'surface'          => ['Card surface',           '#FFFFFF', 'Product cards, panels, modals'],
            'surface_dark'     => ['Card surface (dark)',    '#1D1D1F', 'Cards and panels in dark mode'],
            'surface_dark_alt' => ['Raised surface (dark)',  '#252528', 'Inputs and raised rows in dark mode'],
            'line'             => ['Borders',                '#D2D2D7', 'Dividers and card outlines'],
            'line_light'       => ['Borders (light)',        '#E5E5E7', 'Subtle separators'],
            'line_soft'        => ['Borders (softest)',      '#F0F0F0', 'Hairline rules between rows'],
        ],

        'Banners & Hero' => [
            'banner_bg'          => ['Banner background',  '#F5F5F7', 'Backdrop behind hero slides and promo strips'],
            'banner_text'        => ['Banner text',        '#1D1D1F', 'Headings and copy laid over banners'],
            'banner_button'      => ['Banner button',      '#0066CC', 'Call-to-action button on banners'],
            'banner_button_text' => ['Banner button text', '#FFFFFF', 'Label colour inside the banner button'],
            'banner_dot'         => ['Active slide dot',   '#0066CC', 'Selected dot in the hero slideshow'],
        ],

        'Status & Badges' => [
            'sale'         => ['Sale / price drop', '#E30000', 'Discounted prices and sale flags'],
            'success'      => ['Success green',     '#7CBA3F', 'In-stock, trade-in and confirmation states'],
            'success_hover'=> ['Success hover',     '#6BA831', 'Hover state for green buttons'],
            'gold'         => ['Gold label',        '#B8860B', 'The "Gold Desire" pre-owned range label'],
            'gold_light'   => ['Gold accent',       '#E3B341', 'Stars, ribbons and gold trim'],
            'gold_tint'    => ['Gold background',   '#FBF3E0', 'Pale gold badge background'],
        ],
    ];

    /**
     * Flat token => default hex map.
     *
     * @return array<string, string>
     */
    public static function defaults(): array
    {
        $defaults = [];

        foreach (self::TOKENS as $tokens) {
            foreach ($tokens as $key => [$label, $hex, $hint]) {
                $defaults[$key] = $hex;
            }
        }

        return $defaults;
    }

    /**
     * The palette actually in force: stored overrides on top of the defaults.
     *
     * @return array<string, string>
     */
    public static function current(): array
    {
        $palette = Settings::group('theme', self::defaults());

        // A malformed stored value must never take the site down — anything that
        // is not a hex colour reverts to its default.
        foreach ($palette as $key => $value) {
            if (! is_string($value) || ! preg_match('/^#[0-9A-Fa-f]{6}$/', $value)) {
                $palette[$key] = self::defaults()[$key];
            }
        }

        return $palette;
    }

    /**
     * "#0066CC" => "0 102 204" — the channel form Tailwind's <alpha-value>
     * colours are built on.
     */
    public static function toChannels(string $hex): string
    {
        $hex = ltrim($hex, '#');

        return sprintf(
            '%d %d %d',
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2))
        );
    }

    /**
     * The <style> body injected into the page head.
     *
     * :root carries the code defaults (so the admin panel is always stock and
     * readable); `.storefront-theme` carries the configured palette.
     */
    public static function css(): string
    {
        $defaults = self::defaults();
        $current = self::current();

        $rootVars = '';
        foreach ($defaults as $key => $hex) {
            $rootVars .= '--c-' . str_replace('_', '-', $key) . ':' . self::toChannels($hex) . ';';
        }

        $themeVars = '';
        foreach ($current as $key => $hex) {
            if ($hex === $defaults[$key]) {
                continue; // nothing to override
            }
            $themeVars .= '--c-' . str_replace('_', '-', $key) . ':' . self::toChannels($hex) . ';';
        }

        $css = ':root{' . $rootVars . '}';

        if ($themeVars !== '') {
            $css .= '.storefront-theme{' . $themeVars . '}';
        }

        // Canvas colour has to land on <html> too, otherwise overscroll on short
        // pages flashes the stock grey rather than the configured page colour.
        $css .= 'html{background-color:' . $current['page'] . ';}';
        $css .= 'html.dark{background-color:' . $current['page_dark'] . ';}';

        return $css;
    }
}
