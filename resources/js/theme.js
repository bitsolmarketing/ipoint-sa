/**
 * Reads a palette colour out of the live CSS custom properties.
 *
 * Needed wherever a colour is handed to something that cannot take a CSS class
 * — canvas, SVG attributes, third-party SDKs such as HERE Maps.
 *
 * The configured palette lives on `.storefront-theme` (defaults sit on :root),
 * so resolve against that element when it is present and fall back to the
 * document root otherwise.
 *
 * @param {string} token  Palette token, e.g. 'brand' or 'success'
 * @param {string} fallback  Colour used if the variable is missing
 * @returns {string} A CSS colour, e.g. "rgb(0 102 204)"
 */
export function themeColor(token, fallback = '#0066CC') {
    if (typeof window === 'undefined') return fallback;

    const scope = document.querySelector('.storefront-theme') || document.documentElement;
    const channels = getComputedStyle(scope).getPropertyValue(`--c-${token}`).trim();

    return channels ? `rgb(${channels})` : fallback;
}
