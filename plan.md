# Bugdata website iteration: operating systems that reduce operational waste

## Implementation approach

Continue in the existing static multi-page website and repository. Make the homepage the clearest statement of Bugdata’s shift from a list of digital tools toward identifying operational friction, designing a better way of working, implementing an end-to-end operating system, and agreeing how results will be measured. Put all five requested positioning pillars on the homepage in plain language. Use assessment and measurement language; do not invent case studies, savings figures, headcount reductions, revenue gains, ROI guarantees, or delivery deadlines.

Reframe the Solutions page around practical operating needs and describe AI as one optional enabler. Rework the existing AI/automation route into a page about process design and workflow automation, retaining its URL, examples, links, and enquiry routing. Align the existing process and project enquiry pages so they ask about workflows and desired outcomes, while keeping service values and WhatsApp handling compatible. Keep all other routes, forms, portal/authentication, checkout/cart/payment, prices, Supabase configuration and application scripts intact.

Use the existing locally hosted photographs and Bugdata logo; do not add generic tech stock imagery. Add one shared design layer after the current CSS that removes the prior cosmic/robot-futuristic appearance in favor of a bright, quiet, Spaceship-inspired product-services structure: concise sections, strong hierarchy, generous whitespace, subtle lines, visible navigation, simple cards, direct calls to action, and restrained motion. The palette remains rooted in the actual Bugdata teal, with its existing mint/cyan and violet logo colors as measured accents. Keep existing accessibility refinements, focus visibility, responsive navigation, Escape close, reduced-motion support and route anchors.

A small optional on-page estimate may help a business quantify the current labor cost tied to repeat work. It must be user-entered, clearly illustrative, locally calculated, and explicitly not presented as recoverable savings or a forecast of ROI. No submitted data or new backend integration is needed.

## Design direction

**Design movement:** Spaceship-inspired clarity for practical business services, adapted to Bugdata rather than copied: a restrained, bright interface with simple navigation, crisp section labels, editorial typography, candid local context and clear next actions.

**Core principles:** (1) Lead with operational outcomes, not a technology list. (2) Explain the method before naming tools. (3) Make unverified impact measurable rather than promised. (4) Keep the site calm, legible, responsive and connected to the real Bugdata brand and Zimbabwean business context.

**Color philosophy:** A warm near-white canvas and dark ink make the service content feel open and dependable. The logo’s deep teal anchors navigation and primary actions; mint/cyan and violet are small identity accents only. Cards and dividers stay quiet so the copy—not glowing effects—carries the message.

**Layout paradigm:** A direct hero with a human image and one principal CTA leads into the operational problem, five short positioning pillars, a measured process, supporting services and the company’s learning/community commitments. Keep detail and transactions on their established pages.

**Signature elements:** (1) A slim numbered five-pillar index. (2) A simple Map → Design → Build → Deploy → Support route. (3) Compact measurement notes that distinguish an estimate or goal from a verified result.

**Interaction and animation:** Keep existing navigation, enquiry submission, portal, course, checkout/cart/payment and support interactions untouched. The illustrative labor-cost estimator uses only local form inputs and updates an accessible live result; it neither submits nor stores data. Hover/motion is subtle and never required to understand the page. Maintain visible keyboard focus, Escape/mobile-menu behavior, usable touch targets and reduced-motion support.

**Typography system:** Retain DM Sans for clear body copy and Space Grotesk for concise headlines and numeric labels, with system fallbacks. Use short line lengths, a restrained heading scale and comfortable body spacing.

**Brand essence:** Bugdata helps Zimbabwean businesses find avoidable operational work and build practical systems around the way the business needs to run. Personality: grounded, resourceful, accountable. Voice: candid, practical, non-hype. Example lines: “Find the work costing you time.” and “Map the process. Build what the process needs.”

**Wordmark and mark:** Preserve the supplied Bugdata logo and wordmark; do not substitute a text-only logo or another company’s identity.

**Signature brand color:** Bugdata deep teal, sampled from the existing logo; retain the existing mint/cyan and violet logo accents sparingly.

## Project structure and responsibilities

- Root `*.html`: the existing 14 pages, route metadata, navigation, product/pricing content, forms, portal and application behavior. Edit homepage, Solutions, workflow/automation, process and project-enquiry copy in place.
- `assets/operations-refresh.css`: shared simple/light visual layer loaded after existing stylesheets; keeps layouts and behavior, adds the home positioning component styles, and harmonizes shared public-page components.
- `assets/ux-refinements.css` and `assets/ux-refinements.js`: retain existing keyboard, mobile navigation, focus and reduced-motion support.
- `assets/images/`, `assets/bugdata-logo.png`: existing approved/captioned imagery and identity assets.
- `courses.js`, `cart.js`, `admin.js`, `portal.js`, `supabase-config.js`, `portal.css`, payment-related pages, and `supabase/`: existing application, authentication and checkout paths; do not alter.
- `manus-routes.json`: complete static page route inventory used while previewing; keep it synchronized with root HTML pages.

## Material constraints

The live release at `20a59068394548a765fb950dae95fd5e4c645e47` must remain unchanged during this review. Do not commit, push, create a checkpoint or publish this iteration until DOAZ explicitly approves it. Preserve the eligible Zimbabwe-domain website offer at **$24.99**, the `.com` offer at **$50**, and course fees at **$100** and **$50**. Retain existing route paths, in-page anchors, navigation, forms, portal/authentication, course access/progress, checkout/cart/payment paths, Supabase configuration, and existing application scripts. Do not claim Bugdata is exclusively an AI company; do not guarantee savings, ROI, revenue, headcount changes or delivery speed without verified evidence. No external research is needed for this user-directed update.
