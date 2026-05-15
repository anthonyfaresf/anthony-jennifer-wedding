# Wedding Website — Brief

*Anthony's words, captured 2026-05-01.*

## What I want
A wedding website that:
- Handles reservations (RSVP form)
- Has some kind of story (how we met → engagement → today)
- Animations as people scroll (cinematic feel)
- Takes the reservations
- Sends email confirmations (via Hostinger SMTP + n8n Email node — WhatsApp auto-send is off-stack; Anthony messages personally if desired)
- Sends email cancellations (same path; no auto-WhatsApp)
- Has the map of the venue
- Has photos of me and my wife-to-be

## Sections (proposed — confirm before build)
1. **Hero** — names + date + scroll cue + soft animation reveal
2. **Our Story** — timeline (met → first date → engagement → today) with scroll-triggered reveals per chapter
3. **Photos** — couple gallery, 6–10 images, lazy-loaded, lightbox on click
4. **Venue** — name, address, map embed (custom-styled), arrival info, parking notes
5. **Schedule** — ceremony, cocktail, dinner, dancing — timeline with times
6. **RSVP** — form (name, email, phone, party size, dietary, +1 name, attending/declining, optional message)
7. **FAQ** — dress code, kids, gifts, accommodation suggestions
8. **Travel info** (if international guests) — airport, recommended hotels
9. **Footer** — contact, cancellation link, language toggle if multilingual

## RSVP requirements
- One form per guest party (not per person)
- Required: name, email, phone, attending (yes/no)
- If attending: party size, dietary restrictions, +1 name
- Optional: message to the couple
- Submit → store in Cloudflare D1 → trigger n8n webhook → fire confirmation email via Hostinger SMTP (n8n Email node) · ~~Klaviyo~~ FindFetch-scope-locked · ~~WhatsApp Cloud API~~ off-stack (per `Projects/ai-os/tool-stack.json` 2026-05-15)
- Confirmation includes: cancellation link with unique token (no password needed)
- Cancellation → updates D1 record → fires cancellation email to guest + notification to Anthony; WhatsApp confirmation deferred (Anthony optionally messages guests manually from his existing number)

## Animation references
- (TBD — will fill from Instagram refs once URLs are dropped in `_urls.txt`)

## Inspiration sources
- Instagram references: `assets/design-refs/instagram/`
- Other refs (screenshots, websites, PDFs): `assets/inspiration/`

## Stack non-negotiables
- Cloudflare Pages hosting
- GSAP for scroll animations
- Anti-AI-writing on every word of copy
- Real couple photos only (no AI-generated faces)
- Mobile-first (most guests will RSVP on phone)
- Lighthouse ≥90 across all categories before launch

## Open decisions (to confirm)
- [ ] Domain name
- [ ] Single language vs multilingual (Lebanon → likely EN + Arabic + French)
- [ ] Map: Mapbox custom-styled vs Google Maps embed
- [ ] Photo source: existing photos vs new shoot
- [ ] WhatsApp number to display on the site for manual contact (Anthony's existing number vs a new dedicated one) — note: this is only a `tel:` / `wa.me/` link for guests to message manually; the WhatsApp Business Cloud API path is OFF-STACK and not in scope
- [ ] Tone: classic-elegant vs editorial-modern vs playful-warm (drives the design)
