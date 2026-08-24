# Mayura Jewellers — Frontend

A production-ready, frontend-only storefront for **Mayura Jewellers** — Thakur Village,
Kandivali East, Mumbai. Serving Kandivali since 2004, now in its third generation.
Built as a luxury editorial experience rather than a conventional e-commerce template.

> **Frontend only.** There is no backend, no database, no authentication and no payment
> gateway in this project. Sign in, sign up, wishlist, bag and checkout all exist as fully
> designed screens with real interaction — they simply do not talk to a server. The single
> exception is the contact form, which posts directly to [Web3Forms](https://web3forms.com)
> and needs no server of ours. See [Contact form](#contact-form-web3forms).

---

## Quick start

```bash
npm install                  # once
cp .env.example .env.local   # once — then paste the Web3Forms access key
npm run dev                  # http://localhost:5173
npm run build                # production bundle → dist/
npm run preview              # serve the production bundle locally
npm run lint                 # eslint
```

Node 18 or newer.

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 with a bespoke token layer |
| Animation | Framer Motion 11 |
| Icons | Lucide React (thin line set) |
| Routing | React Router 6 |
| State | React Context + `localStorage` (no server) |

Vendor code is split into `react-vendor`, `motion` and `icons` chunks so the initial payload
stays small. Every route is a plain import today; converting to `React.lazy` is a one-line
change per route when the catalogue grows.

---

## Folder structure

```
mayura-jewellers/
├─ public/
│  ├─ favicon.svg                 peacock-plume monogram
│  └─ images/
│     ├─ brand/                   logo, transparent and flat
│     ├─ editorial/               models, lifestyle and still life
│     ├─ styled/                  silk-ground product photography
│     └─ products/                cut-outs on the ivory ground
├─ scripts/
│  └─ build-assets.sh             regenerates public/images from raw photography
├─ src/
│  ├─ assets/                     imported (bundled) assets
│  ├─ components/
│  │  ├─ cards/                   ProductCard, CollectionCard, CategoryCard, StoryCard,
│  │  │                           ReviewCard, BlogCard
│  │  ├─ collection/              FilterPanel, SortDropdown, QuickView
│  │  ├─ common/                  Button, IconButton, Field set, Accordion, Modal, Drawer,
│  │  │                           Pagination, Rating, SmartImage, EmptyState, Badge,
│  │  │                           JewelIcons (bespoke thin-line jewellery icon set)…
│  │  ├─ home/                    Hero, TrustStrip, ProductRail, ShopByCategory,
│  │  │                           SignatureCollections, CraftsmanshipBanner, BridalFeature,
│  │  │                           WhyChooseUs, TestimonialsSection, InstagramGallery, VisitStore
│  │  ├─ layout/                  Navbar, MegaMenu, MobileMenu, SearchOverlay, Footer,
│  │  │                           WhatsAppButton, Toaster, PageHero, Logo, ScrollToTop
│  │  ├─ motion/                  Reveal, Stagger, RevealHeading, ImageReveal
│  │  └─ product/                 ProductGallery
│  ├─ constants/                  site.js (all business data), routes.js, motion.js
│  ├─ context/                    ShopContext — cart, wishlist, recently viewed, toasts
│  ├─ data/                       products, categories, collections, faq, blog, testimonials,
│  │                              policies, legacy, gallery, navigation, search
│  ├─ hooks/                      scroll, media query, body lock, focus trap, storage, …
│  ├─ layouts/                    RootLayout, AuthLayout
│  ├─ pages/                      one file per route (auth pages under pages/auth)
│  ├─ styles/index.css            base layer, component layer, utility layer
│  └─ utils/                      cn, format (INR / weights / dates), catalogue (filter, sort,
│                                 search, related), web3forms (contact form delivery)
├─ .env.example                   the one environment variable this site needs
├─ tailwind.config.js             the design system
├─ vite.config.js                 aliases and chunking
└─ jsconfig.json                  editor path resolution
```

Path aliases (`@components`, `@data`, `@utils`, `@constants`, `@hooks`, `@context`,
`@layouts`, `@pages`, `@assets`) are configured in both `vite.config.js` and `jsconfig.json`.

---

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero, assurances, new arrivals, categories, collections, craftsmanship, best sellers, bridal, why choose us, reviews, Instagram, visit |
| `/collections` | Collections index — alternating editorial spreads |
| `/collections/:slug` | Collection / department / piece-type grid, filters, sort, quick view, pagination |
| `/product/:slug` | Product — gallery with zoom & lightbox, specification, stones, care, shipping, returns, warranty, FAQs, related, recently viewed |
| `/about` | Story, mission, vision, craftsmanship, heritage timeline, founder's message, values, store |
| `/legacy` | Since 2004 — specialities, in-store & home services, BIS hallmarking, the third generation, digital presence, why Mayura |
| `/contact` | Owner and business details, hours, form, map, store gallery, top FAQs |
| `/search` | Search results, trending, recent, popular categories, empty state |
| `/wishlist` | Saved pieces, move to bag, luxury empty state |
| `/cart` | Bag, coupon UI, order summary |
| `/checkout` | Address, delivery, payment method UI, place order |
| `/order-confirmed` | Confirmation with reference |
| `/faq` | Nine categories, ~50 questions, live search |
| `/blog`, `/blog/:slug` | The Journal — eight long-form articles |
| `/testimonials` | Rating summary, distribution, twelve reviews |
| `/gallery` | Filterable masonry gallery with lightbox |
| `/terms-and-conditions`, `/privacy-policy`, `/shipping-policy`, `/return-policy` | Legal pages with a shared renderer and in-page contents |
| `/login`, `/signup`, `/forgot-password` | Split-screen auth flow, including a four-step OTP reset |
| `*` | 404 |

---

## The header

Two rows, always solid, always visible — it never goes transparent over the hero.

1. **Utility row** — logo, a wide search field with visual-search and voice-search controls, then
   store / wishlist / account / bag. Voice search uses the browser's own Web Speech API, so it
   needs no backend; where the engine is unavailable the control is not rendered at all.
2. **Category rail** — ten categories, each with a bespoke thin-line jewellery icon
   (`src/components/common/JewelIcons.jsx`) and a full-width mega menu on hover or focus.
   Horizontally scrollable on small screens.
3. **Service strip** — free gold testing, melting, repairs, home visits, BIS certification.
   Collapses away on scroll so the header stays compact once you are into the page.

The hero beneath it is a five-slide banner carousel. Each slide is a split composition — a colour
field carrying live text alongside a photograph — rather than type baked into an image, so the
headlines stay responsive, translatable and readable by assistive technology. Autoplay pauses on
hover and on focus, arrow keys work, and neighbouring slides peek in at the gutters.

---

## Design system

Tokens live in `tailwind.config.js`; reusable classes in `src/styles/index.css`.

**Colour**

| Token | Hex | Role |
| --- | --- | --- |
| `champagne` | `#B5A88D` | Primary background |
| `ivory` | `#F7F3EA` | Light background |
| `charcoal` | `#292621` | Primary text |
| `gold` | `#D4AF37` | Accent |
| `bronze` | `#8A6A3F` | Secondary accent |
| `espresso` | `#2B211C` | Dark luxury sections |
| `success` | `#3C6E47` | Success |
| `error` | `#B33A3A` | Error |

Each has a 50–900 ramp. Fine-grained opacity steps (`/6`, `/8`, `/12`, `/18`…) are added to the
theme because the hairlines in this system sit between Tailwind's default 5% stops.

**Type**

- Display — Playfair Display (fluid `display-xs` → `display-2xl`, all `clamp()`-based)
- Serif accent — Cormorant Garamond, used italic for pull quotes and meanings
- Sans — Inter, small and quiet, with a wide-tracked `eyebrow` scale for small caps labels

**Components** — `mj-btn-primary`, `mj-btn-gold`, `mj-btn-outline`, `mj-btn-ghost`
(+ `mj-btn-sheen` for the gold sweep), `mj-field-line` / `mj-field-box`, `mj-card`, `mj-panel`,
`mj-badge-*`, `mj-link`, `mj-underline`, `mj-flourish`, `mj-media-zoom`.

**Motion** — one easing curve (`cubic-bezier(0.22, 1, 0.36, 1)`) and a 300–900 ms band across
the whole site. `prefers-reduced-motion` is honoured globally.

---

## Photography pipeline

`scripts/build-assets.sh` regenerates `public/images` from the raw folder. It renames every
file descriptively, upscales with Lanczos, and — for the white-ground cut-outs — levels the
backdrop to pure white then MULTIPLY-composites it onto a warm ivory 4:5 plate, so the
jewellery and its soft shadow land on the brand ground with no visible seam.

```bash
bash scripts/build-assets.sh "/path/to/raw/assets" public/images
```

Requires ImageMagick 6+.

### ⚠️ Image licensing — read before going live

The photographs supplied for this build are campaign images belonging to other jewellery
brands, and several feature paid celebrity ambassadors. They are in place so the site can be
presented and reviewed with realistic art direction. **They must be replaced with Mayura's own
photography before this site is published.** Files with third-party logos or campaign lock-ups
were excluded or cropped during processing, but the underlying rights issue remains.

Replacing them is a drop-in operation: keep the filenames in `public/images/**` and nothing in
the code needs to change.

---

## Content

Everything is authored, editable data — no lorem ipsum anywhere.

- **`src/constants/site.js`** — brand, owner, address, phone, email, hours, socials, assurances.
  Change it here and it updates in the navbar, footer, contact page, structured data and the
  WhatsApp handoff.
- **`src/data/products.js`** — 60 pieces with purity, gross and net weight, making charges,
  stone breakdowns, sizes, care, shipping, returns and warranty.
- **`src/data/faq.js`** — ~50 questions across nine categories, following the structure used
  across Indian jewellery retail, extended with purity, certification, care, warranty and
  customisation.
- **`src/data/policies.js`** — Terms, Privacy, Shipping and Returns.
- **`src/data/blog.js`** — eight long-form articles.
- **`src/data/testimonials.js`** — twelve reviews.

### Legal copy

**Terms & Conditions** reproduces Mayura Jewellers' own terms of trade exactly as supplied,
grouped into readable sections without any clause being reworded or reordered.

**Privacy, Shipping and Return** are professionally drafted **template** copy for an Indian
jewellery retailer. They are not legal advice. Statutory references (Section 269ST, GST rates,
BIS hallmarking rules) reflect the position at the time of writing — have your advocate review
the text and confirm current rates before publication.

---

## Contact form (Web3Forms)

The enquiry form on `/contact` sends a real email. It uses
[Web3Forms](https://web3forms.com), which accepts a POST from the browser and forwards it to
the inbox its access key was issued for — so the site stays a static deployment with no server,
no serverless function and no dependency added to `package.json`.

**One-time setup**

1. Go to [web3forms.com](https://web3forms.com), enter **mayurajewellers2019@gmail.com** and
   press *Create Access Key*. The key is emailed to that inbox and every submission is
   delivered there. The recipient is bound to the key, so changing where enquiries land means
   issuing a new key — never editing code.
2. Locally: `cp .env.example .env.local` and paste the key after
   `VITE_WEB3FORMS_ACCESS_KEY=`. Restart `npm run dev`.
3. On Vercel: **Project → Settings → Environment Variables** → add
   `VITE_WEB3FORMS_ACCESS_KEY` for Production, Preview and Development, then redeploy so the
   value is baked into the bundle.

Until the key is set the form degrades gracefully: it never posts, and it tells the visitor to
call or WhatsApp instead.

**What arrives in the inbox** — name, email (also set as reply-to), mobile number, selected
service, message, the submission timestamp in IST, and `Consent: Yes` with the full consent
wording the visitor agreed to. A hidden `botcheck` honeypot field travels with every
submission; Web3Forms silently drops anything that arrives with it filled in.

**On the access key being public** — Vite inlines every `VITE_`-prefixed variable into the
client bundle, and that is how Web3Forms is meant to be used: the key is a write-only
identifier that can post a message to one fixed inbox and read nothing back. Do not put a real
secret (API secret, database URL, password) behind a `VITE_` prefix.

The transport lives in `src/utils/web3forms.js`; the page state machine
(`idle → sending → sent | error`) lives in `src/pages/ContactPage.jsx`.

---

## Accessibility

- Semantic landmarks, one `<h1>` per page, correct heading order
- Skip-to-content link, visible gold focus ring on every interactive element
- Focus trapping and restore in the drawer, modal, search overlay and mobile menu
- `aria-expanded` / `aria-controls` on the accordion, mega menu and sort dropdown
- `aria-pressed` on toggles, `aria-current` on pagination and active navigation
- `role="status"` with polite live regions for toasts and form confirmations, and
  `aria-invalid` / `aria-describedby` on fields that fail validation
- Keyboard-operable gallery, filters, quick view and OTP inputs
- `prefers-reduced-motion` respected globally

Verified across 28 routes at 1440 / 820 / 390 px: no console errors, no horizontal scroll,
exactly one `<h1>` per page. The hero carousel exposes a single visually-hidden `<h1>` for the
page — a rotating banner is not a heading hierarchy — and each slide is a labelled
`aria-roledescription="slide"` group.

---

## Performance

- Every image goes through `SmartImage` — lazy by default, `priority` for above-the-fold,
  champagne shimmer placeholder, fade on decode, graceful failure state
- Vendor chunking; ~96 kB gzipped app JS, ~13 kB gzipped CSS
- No runtime CSS-in-JS, no icon font, no jQuery, no carousel library
- Fonts loaded from Google Fonts with `preconnect` and `display=swap`; the full fallback stack
  is declared, so the layout does not shift if they fail

---

## Notes for the next developer

- **Wiring a backend** — the only stateful surface is `src/context/ShopContext.jsx`. Replace its
  `localStorage` calls with API calls and the entire UI follows.
- **The catalogue** — `src/utils/catalogue.js` holds `resolveGroup`, `filterProducts`,
  `sortProducts`, `searchProducts` and `relatedProducts`. Swap `src/data/products.js` for a fetch
  and these keep working unchanged.
- **Gold rate** — prices are static fixtures. In production the rate belongs in a single
  place (a config or a small endpoint) and `formatPrice` should receive computed values.
- **`ImageReveal`** — the scroll observer deliberately sits on the outer, unclipped container.
  An element carrying `clip-path: inset(0 0 100%)` reports no intersection area in Chrome, so an
  observer attached to it never fires. Do not move it inward.
- **`<main>` uses `overflow-x: clip`**, not `hidden` — `hidden` would turn it into a scroll
  container and break every `position: sticky` inside it.

---

© Mayura Jewellers. Proprietor: Darshil Bhandari.
Shop No. 12, 13, 14, Rangoli Building, Vasant Utsav, Thakur Village, Mumbai, MH 400101.
#   M a y u r a _ J e w e l l e r s  
 
---

## August 2026 — Royal Blue Redesign & Feature Release

The site was re-themed to the Mayura brand primary **#004976 (Pantone 7693 C)** with gold
accents, and extended with the following (all frontend-only, backend-ready):

**New sections & pages**
- Shop by Category (6 windows: Gold, Diamond, Gemstones, Italian, Gold Coins, Kids) under the hero
- The Mayura Advantage benefits band · 7 Mayura Promises · Founder's note · Brands Family carousel
- Join Mayura Jewellers Insiders email capture · Explore Our Diamond Cuts (original SVG line art)
- `/rishta-plan` — 11+1 savings plan with interactive calculator (`src/data/rishta.js`)
- `/video-consultation` — 4-step consultation request flow (`consultationService`)
- `/reviews` — alias of the testimonials page

**Product experience**
- Product Details + Price Breakup tabs on every PDP (breakup consumes `product.priceBreakup`
  when real component pricing exists; until then it shows an honest "confirmed at billing" state)
- Gold purity & shade selector (`product.goldOptions` data model; variants flow into the cart line)
- New jewellery-type filters (Jhumkas, Hoops, Pendant Sets, Maang Tikka, Nath, Idols, Gold Coin/Bar…)
  driven by predicates in `src/data/products.js` — styles with zero pieces auto-hide

**Behaviour**
- Navbar dropdowns are click-driven (toggle, outside-click, Escape); "All Jewellery" is now the
  "Mayura" home item; service strip moved onto the royal ground and is always visible
- First-visit engagement: branded notification pre-permission modal first, then the sign-in /
  register modal (mock `authService`, SHA-256 digest only, never plain passwords) — each at most
  once per browser, never on cart/checkout/consultation/auth pages
- Hero carousel now supports touch swipe

**Removed at client request**
- Repairs & Polishing (service strip, legacy services, FAQ), "Gold collections" column in the
  Gold menu, and all "Free Care For Life" claims

**Frontend-only services** live in `src/services/` (`authService`, `newsletterService`,
`notificationService`, `consultationService`). Each file marks its FUTURE API INTEGRATION POINT —
swap the body for a fetch call when the backend arrives; no UI changes needed.

**Awaiting client input:** founder portrait (`FounderSection.jsx`), official brand-family logos
(`src/data/homepage.js`), promises 3–7 wording, final Rishta Plan terms, dedicated coin/idol
photography, real reviews to replace the demo testimonials.
