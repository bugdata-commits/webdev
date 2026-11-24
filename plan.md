# Bugdata premium website refresh plan

## Implementation approach

Replace the current cosmic/glass visual layer with a warm editorial system that prioritizes Bugdata’s existing proposition, Zimbabwean context, real imagery, clear service groups, and straightforward next steps. Apply the system through the currently shared `assets/cosmic-interface.css` link target so all 13 public routes keep their existing page templates and scripts while receiving a consistent redesign. Restyle, but do not rebuild, the shared legacy route template and the four `bd-page` routes.

Rework the homepage hero from a robot/video background into an editorial two-column composition using a locally stored, properly attributed documentary photo. Add a separate local Harare image to the home story sequence with accurate caption and photographer credit. Use no decorative image as false evidence of a Bugdata client, staff member, or outcome. Keep the remaining pages’ content, section anchors, navigation, metadata, scripts, prices, forms, portal and checkout paths intact. No new framework, package, database, or service is required. Optimize selected source images as WebP without changing aspect ratio or content.

## Design direction

**Design movement:** Contemporary editorial studio design with a field-notes sensibility: clear hierarchy, asymmetrical image-and-copy pairings, generous paper-like space and disciplined typographic contrast. It borrows principles—not recognizable compositions—from the comparison sites.

**Core principles:** (1) make the offer and next action obvious; (2) use place and people imagery deliberately, with honest credits and no implied endorsements; (3) let evidence and artifacts support the story; (4) prioritize readable rhythm, accessible controls and calm over effects.

**Color philosophy:** Warm paper and ink create a human, considered base. Bugdata’s existing teal/mint identity becomes a deeper, more restrained green for links and actions; a small clay/saffron accent helps draw attention to decisions without turning the interface neon. Keep the existing logo asset and avoid the prior blue-violet orbital effect.

**Layout paradigm:** Editorial split layouts and staggered, full-width sections replace repeated centered hero/card sequences. Keep service and price content easy to scan; use cards only where the existing information is truly a set of comparable offers. Maintain a compact, clear header and a direct project-enquiry route.

**Signature elements:** (1) fine ruled lines and index-like labels that echo data notebooks; (2) documentary photo frames with small, visible credits; (3) oversized headline typography paired with concise serif or restrained humanist text.

**Interaction and animation:** Preserve familiar anchors and navigation. Keep motion subtle and non-essential, with focus-visible states, mobile touch targets, Escape behavior and reduced-motion support intact. No interaction may obscure content or require animation to read it.

**Typography system:** A confident display sans for headlines; a highly legible humanist sans for UI and body copy; optional editorial serif only for select short quotations or emphasis. Use the existing Google Fonts where practical to avoid adding dependencies, and ensure robust system fallbacks.

**Brand essence:** Bugdata turns data and digital tools into practical business and community capability. Personality: grounded, inventive, generous. Voice: plain-spoken, ambitious and concrete. Example lines: “Make digital work. Build with purpose.” and “Technology should move real work forward.”

**Wordmark and mark:** Retain the supplied Bugdata logo and name treatment; do not introduce a substitute logo. Use the geometric logo as a small brand anchor rather than enlarging it into a decorative hero object.

**Signature brand color:** Restrained deep teal-green derived from the existing logo, with the mint and purple retained only as minor supporting brand cues where needed.

## Project structure and responsibilities

- Root `*.html`: the 13 public static pages, navigation, content, metadata, forms and route-specific markup.
- `assets/cosmic-interface.css`: shared visual-system override file linked across the routes; replace its contents with the new editorial system while retaining its path to avoid risky multi-page link edits.
- `assets/brand-pages.css`: existing base layout for the four `bd-page` pages; leave behavior and structural rules in place and layer the shared visual system over it.
- `assets/ux-refinements.css` and `assets/ux-refinements.js`: existing accessibility, keyboard, responsive and reduced-motion refinements; preserve and verify them.
- `assets/images/`: optimized local copies of the selected Unsplash photography, plus a small attribution note if useful.
- `courses.js`, `cart.js`, `admin.js`, `portal.js`, `supabase/` and their adjacent pages: existing course/student/auth/checkout functionality; no changes planned.

## Material constraints

The site is static HTML/CSS/JavaScript on GitHub Pages. Keep existing routes and file names; do not introduce new hosting or JavaScript dependencies. Keep all already-approved page content and USD prices. Explicitly preserve the eligible Zimbabwean-domain website offer at $24.99, the `.com` offer at $50, and course prices of $100 and $50. Do not alter portal/authentication, forms, checkout, scripts or their data flows. Avoid fabricated clients, testimonials, awards, metrics, local identity for stock people, or promises of outcomes. Research comparison will be completed and the report/notes updated before final commit.
