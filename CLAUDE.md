# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A deliberately tiny single-product webshop that sells one physical greeting card ("beautiful."). It is a static site — no framework, no build step, no package manager. Checkout is handled entirely by the **Shopify Buy Button** SDK loaded from Shopify's CDN; this repo holds no server code and no order/payment logic.

## Files

- `index.html` — markup for all sections (hero, marquee, product, inverted closing, footer) plus the Shopify Buy Button bootstrap script and its config. Effect hooks live on elements as data attributes: `[data-split]` (hero word), `[data-tilt]` (card figure), `[data-magnetic]` (wordmark, nav, buy button).
- `styles.css` — all styling. Design language starts from utrecht.jp (white background, generous whitespace, quiet typography, the card's red as the only accent) but is much more lively.
- `main.js` — interaction layer, organized as one IIFE per effect: speckle canvas with mouse parallax, hero letter-split, scroll-reveal, card tilt + cursor-following glare, custom cursor, and magnetic elements. Everything is gated on `reduceMotion` and (for pointer effects) `finePointer`.
- `card.png` — the product image (also the source of the brand's red and serif look).

## Running it

It's a static site — just open `index.html` in a browser. To serve the folder over http (closer to production; any of these, no preference):

```sh
npx serve            # Node
python3 -m http.server 8000   # if Python is handy
```

There are no tests, no linter, and no build step.

## Shopify configuration (the one thing that must be set)

The Buy Button stays empty until three constants near the bottom of `index.html` are filled in from the Shopify admin:

- `SHOPIFY_DOMAIN` — e.g. `your-shop.myshopify.com`
- `SHOPIFY_STOREFRONT_TOKEN` — Storefront API access token (Shopify admin → Apps → Buy Button)
- `SHOPIFY_PRODUCT_ID` — the product id for "beautiful."

The Buy Button is configured to show **only price + button** (the page already shows the image and title via the `contents` option). The cart toggle is mounted into `#shopify-cart` in the header, the buy button into `#shopify-buy-button`. UI text is German; `moneyFormat` is EUR.

## Design conventions

- Colors live as CSS custom properties in `:root` (`styles.css`). The accent red `--color-accent: #e5362c` recurs in three places that must stay in sync when changed: the CSS variable, the Shopify button styles (hard-coded in `index.html`), and the speckle fill colour in `main.js` (`rgba(229, 54, 44, …)`).
- Display serif is **Fraunces** (loaded from Google Fonts, with Georgia/Times fallback in the `--serif` variable). Used for the wordmark, hero/product titles, taglines and the closing line; everything else uses the system sans stack (`--sans`). The card itself is the reference for the serif look.
- The product section is a two-column grid (image / info) that collapses to one column under 720px. The hero is full-viewport and purely typographic (no card image — the card appears in the product section). The closing section is a full-bleed inverted block (red background, white text).
- Motion must remain optional: anything animated has to be gated behind the `prefers-reduced-motion` checks already present in `styles.css` and `main.js`. Pointer-only effects (custom cursor, magnetic, tilt parallax) additionally check `(hover: hover) and (pointer: fine)` so touch devices keep the native cursor.
- The custom cursor replaces the native one: `body.has-cursor` sets `cursor: none` on interactive elements. If you add new interactive elements, include them in the `hoverSel` list in `main.js` so the cursor ring still reacts.

## Things to keep intact when editing

- No dependencies / no build: keep it a plain static site unless explicitly asked to introduce tooling.
- Shopify owns checkout, cart, inventory, and prices — do not reimplement any of that in this repo.
