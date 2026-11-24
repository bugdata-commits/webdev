# Bugdata premium website refresh — TODO

- [x] **Replace the rejected cosmic visual system across the public site.** Redesign the existing website into a genuinely premium experience informed by the deep comparison of other digital and marketing agency websites. Use a distinctive editorial direction grounded in Bugdata’s own identity and Zimbabwean context; do not copy another agency’s branding or layout. Remove the generic robot/cosmic-glass presentation. Keep the visual hierarchy clear, restrained and cohesive across all 13 public pages.

- [x] **Use authentic, carefully selected local imagery.** Add the verified Harare photo and one properly licensed, appropriately described documentary people photo for planned placements; optimize them as local assets, add accurate captions/credit links, and ensure that illustrative people are not represented as Bugdata staff, clients or testimonials. Do not use watermarked or paid stock-search previews.

- [x] **Preserve approved content and prices.** Keep Bugdata’s identity and previously approved content and pricing. The eligible Zimbabwe-domain website offer stays **$24.99**, the `.com` offer stays **$50**, and course fees stay **$100** and **$50**. Retain the rest of the published service, product, course, community, nature and support content and its prices; do not reintroduce the superseded `$224.99` price or invent missing units, claims or outcomes.

- [x] **Preserve all existing functional behavior.** Do not change the student portal, sign-in/authentication, course requests/progress, forms, checkout/cart/payment paths, Supabase configuration or existing application scripts while redesigning. Existing routes, navigation links, in-page anchors, forms, mobile menus and third-party links must remain functional.

- [x] **Preserve accessibility and responsive behavior.** Maintain semantic content, visible keyboard focus, accessible navigation labels, mobile menu/Escape handling, usable touch targets, reduced-motion support, legible contrast and no horizontal overflow at mobile widths. Visual content must have meaningful alternative text or remain decorative as appropriate.

- [x] **Verify and publish the finished website.** Check the public pages at desktop and mobile widths, confirm that pricing and route content remain intact, confirm no image/link/runtime failures or browser errors, and verify that existing interaction flows still work. Commit and push the approved redesign to `main`; confirm the GitHub Pages build for that revision before reporting the live URL. All 13 pages passed the browser audit at desktop/mobile sizes; narrow-screen overflow was corrected and retested at 320–414px. The published Pages build completed successfully for commit `b1b7586660b55aff7705cdaa4b9074b6a47274e4`.


# Supplied-code design iteration

- [x] **Adapt the supplied single-page dark-tech concept to Bugdata’s existing multi-page website.** Use its navy/cyan technical visual language and clear section hierarchy as a starting point, but retain Bugdata’s supplied identity, routes and company purpose. Do not present the prototype as a drop-in replacement for the 13 existing pages. The homepage uses the existing credited people photo and Harare story image; the orb motif is no longer the dominant hero visual.

- [x] **Keep approved offers and business content intact.** Preserve the eligible Zimbabwe-domain website offer at **$24.99**, the `.com` offer at **$50**, and course fees at **$100** and **$50**. Keep the existing service, product, course, community, nature and support details; do not import unsupported claims or contact details from the prototype.

- [x] **Preserve existing functionality and keep production unchanged during review.** Do not replace or alter portal/authentication, forms, course progress, checkout/cart/payment, Supabase, or existing scripts. Keep the current live website unchanged until the adapted version is reviewed and approved by the user. No portal, auth, cart, payment, Supabase or UX behavior files were modified; no commit or push was made.

- [x] **Test the adapted design before asking for review.** Check the existing pages at desktop and mobile widths, verify routes and anchors, prices, image loading, browser errors, responsive overflow, visible focus, reduced motion, and mobile-menu Escape behavior. Do not publish this iteration until the user approves it. All 14 root HTML pages passed HTTP/H1 checks; all tested at 320/360/390/414px without horizontal overflow; anchors/assets, desktop/mobile rendering, focus, reduced motion and Escape behavior passed. No browser errors, failed requests or HTTP errors were recorded.
