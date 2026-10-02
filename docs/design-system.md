# TDAG News design system — Phase 2 baseline

The owner's brand and typography decisions override generic design suggestions. The design exploration supports a calm editorial hierarchy: generous reading space, clear evidence, restrained teal, navy headings, off-white support surfaces and minimal motion. Avoid a full-viewport hero, noisy card grid, decorative gradients or fabricated news photography.

## Tokens and type

CSS tokens are in `src/app/globals.css`. Primary teal `#0B9E87`, navy `#1B304B`, off-white `#EFF2F2`, near-black `#0D1C2D` and white are the approved base. The interface uses self-hosted Newsreader and Manrope variable fonts via Fontsource, with fallbacks. The detailed size table lives in [project-brief.md](project-brief.md); implementation uses responsive `clamp()` within its approved ranges.

Use Newsreader for lead/article headlines, article body, larger editorial cards and pull quotes. Use Manrope for standfirsts, UI labels, smaller cards, metadata, buttons, menus and source controls. Article line length targets approximately 65–75 characters on desktop. The reading column is capped at 760px; adjacent context is secondary and stacks below the article on mobile.

## Patterns

| Surface | Design rule |
| --- | --- |
| Header | Text mark until small logo variants are approved. Six high-value links on desktop; accessible disclosure menu on mobile. Search/account controls join when those routes exist. |
| Home | Lead story plus quieter supporting hierarchy, latest and curated sections. No fake Most Read or filler. |
| Article | Category, headline, standfirst, author/time, body, optional explanatory modules, real inline citations, source list and related coverage. Optional modules appear only when they add value. |
| Brief | Scannable sequence of important items with context and links to original evidence or TDAG coverage. |
| Search | Fast input, useful filters, explicit empty/no-results states, no invented result counts. |
| Newsroom | Compact factual information density, source/claim warnings, clear primary action, mobile owner review. |
| Empty state | Explain what exists and what action is possible; never fabricate content. |

## Accessibility and responsive checks

- Semantic headings, visible 3px focus outline, skip link, labelled navigation and touch targets of at least 44px for interactive controls.
- Verify normal-text color contrast at 4.5:1 or better; use darkened teal `#087B69` for small text rather than primary teal on white.
- Do not rely on hover to reveal essential actions. Keyboard navigation and screen-reader names must remain coherent at mobile and desktop widths.
- Respect reduced motion; no perpetual animation, autoplay or parallax. Media reserves space and provides alt text, captions and credits.
- Check at 375px, 768px, 1024px and 1440px, plus zoom/text scaling. Confirm no horizontal overflow or obscured focus.

## Preview and logo

`/design-preview/article` is available only in development and is excluded from indexing. It contains explicitly fictional explanatory copy and no decorative fake citations. Production requests return 404. The original supplied PNG remains in `assets/brand/tdag-news-logo-original.png`; small transparent/header/favicon variants require visual and ownership approval before use.

The design skill suggested a full-bleed hero and red news palette. Those conflict with the governing TDAG specification, so this system uses the owner's restrained editorial direction instead.
