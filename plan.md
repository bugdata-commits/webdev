# Bugdata redesign iteration: supplied dark-tech concept

## Implementation approach

Use the user's supplied standalone HTML as the visual reference for a new iteration, not as a drop-in site replacement. Its dark navy/cyan color system, technical grid, emphatic display headlines, section rhythm, and small status-like details will inform the existing static website. Adapt those ideas to the actual Bugdata page templates and routes rather than copying the prototype's one-page structure, unsupported copy, contact details, or mailto form.

Restyle the homepage into a clear, branded landing experience that points into Bugdata's existing services, pricing, student portal, community, nature and support pages. Apply a coherent visual system through `assets/cosmic-interface.css` so legacy shared pages and the four `bd-page` pages receive the same theme while preserving their existing markup, links, scripts and forms. Preserve responsive focus states, mobile navigation and Escape behavior using the existing `assets/ux-refinements.css` and `.js`.

Retain locally stored and credited Harare and illustrative people photographs where they fit the revised art direction. The prototype's abstract orb/grid motif may be used as a secondary visual detail, not as the only or dominant proof of Bugdata's work. Use no invented client evidence, staff identity, metrics, or outcome claims.

## Design direction

**Design movement:** Technical editorial with a Zimbabwean field-notes perspective: a deep instrument-panel canvas, hard-working type, and a few clear data-like markers—not generic futuristic effects.

**Core principles:** (1) make the company, services and next action obvious; (2) balance the supplied high-energy dark visual with genuine Bugdata context; (3) distinguish projects, illustrative images and concepts honestly; (4) keep the multi-page experience legible, responsive and accessible.

**Color philosophy:** Use deep ink/navy as a confident digital canvas. Electric blue and cyan are reserved for actions, data marks and focus. Keep large text near-white and body text muted but legible. Avoid glowing gradients across every surface; allow occasional lighter content stages to create rhythm.

**Layout paradigm:** Preserve the actual page routes and use the supplied concept's bold hero, ordered service index, concise process and training sections as homepage patterns. Keep service details, prices, portal access and support within their proper existing routes. Prefer asymmetrical image/copy compositions over repeated centered panels.

**Signature elements:** (1) a fine technical grid or line motif used sparingly; (2) compact numbered/labelled section markers; (3) a structured, data-inspired hero visual paired with locally grounded photography.

**Interaction and animation:** Reuse functioning nav, forms, portal and checkout. Keep hover and reveal motion subtle and nonessential; use visible focus, touch-sized menu controls, Escape close, and reduced-motion rules. Don't hide critical content before JavaScript runs.

**Typography system:** Use the existing DM Sans and Space Grotesk assets where supported, with robust system fallbacks. Use a compressed, bold display scale for short statements and a calmer readable body scale for dense service and course content.

**Brand essence:** Bugdata turns data and digital tools into practical business and community capability. Personality: grounded, inventive, generous. Voice: plain-spoken, ambitious and concrete. Example lines: “Make digital work. Build with purpose.” and “Technology should move real work forward.”

**Wordmark and mark:** Keep Bugdata's supplied logo/wordmark; do not replace it with the prototype's unapproved text treatment.

**Signature brand color:** Bugdata deep green/teal remains the ownable brand cue; electric blue/cyan from the supplied reference is a supporting interaction color.

## Project structure and responsibilities

- Root `*.html`: existing public pages, routes, SEO, navigation, prices, forms, portal and business content. Update the homepage markup only where needed to make the reference work with Bugdata's identity and current page routes.
- `assets/cosmic-interface.css`: shared visual system for existing legacy and `bd-page` templates.
- `assets/brand-pages.css`: existing source rules for brand pages; retain behavior and use shared overrides for cohesive appearance.
- `assets/ux-refinements.css` and `assets/ux-refinements.js`: keyboard, navigation and accessibility support; preserve and test.
- `assets/images/`: existing locally hosted, licensed, credited images.
- `courses.js`, `cart.js`, `admin.js`, `portal.js`, `supabase-config.js`, `portal.css`, and `supabase/`: existing application/authentication/checkout code; do not change.

## Material constraints

The input is a single-page concept and cannot replace this 13-page website without dropping working functionality and approved content. Do not replace existing Bugdata navigation with in-page-only links. Do not introduce the supplied prototype's email form or contact numbers as new canonical functionality. Preserve the website offers at $24.99 for eligible Zimbabwean-domain websites and $50 for .com, and course fees of $100 and $50. Retain all existing price and scope content, portal/auth, forms, checkout/cart/payment, Supabase configuration, URLs and scripts. Leave the currently published version unchanged while this iteration is under review; publish only after the user approves the adapted result.
