# ByteBrief design pass — progress

## Fixed

- [x] Story thumbnails were painted underneath the monogram fallback.
- [x] The Register's extensionless image URLs were rejected by the parser.
- [x] Added `og:image` enrichment for feeds that ship no image.
- [x] Added regression tests for both image bugs.

## Design

- [x] Restore the original ByteBrief wordmark in the header, footer, and auth pages.
- [x] Apply the UI/UX Pro Max editorial direction: Newsreader + Roboto, warm paper/ink palette, vermilion signal accent.
- [x] Remove the generic purple/cyan AI look: glows, gradients, oversized radii, blue logo tile.
- [x] Restyle cards, navigation, chips, buttons, forms, modal, and footer with flat surfaces, hairline rules, and 1–2px radii.
- [x] Update font loading on every page and warm the browser theme colour.

## Verification

- [x] Parser tests pass (12/12).
- [x] All 234 data image URLs return `200` with an image content type.
- [x] 224 of 240 stories have thumbnails at this refresh; Hacker News is skipped because its links leave the publisher's host.
- [x] Thumbnails paint above their monogram fallbacks.
- [x] Text and accent pairs meet 4.5:1 contrast in both themes.
- [x] Light and dark themes checked at 1440px and 390px.
- [x] Zero console errors, failed requests, broken images, or horizontal overflow across all public pages.
- [x] Commit and push to `main`.

## Owner actions after deploy

- [ ] Rotate the GitHub token used for the push.
- [ ] Enable Google sign-in / authorized domains in Firebase.
- [ ] Deploy `firestore.rules`.
