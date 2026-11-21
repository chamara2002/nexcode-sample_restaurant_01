# Pahana — 3D story website for a Sri Lankan restaurant

A static website where scrolling follows a single flame: it leaves a clay oil lamp,
drifts through floating spices, lights the wood hearth, dives into a clay pot of curry,
lands on rice and curry served on banana leaf, and finally lights the lamp on the
guest's table — where the WhatsApp booking form waits.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site is written to /out
```

Upload the `out/` folder to any static host (Vercel, Netlify, Cloudflare Pages, cPanel).

## Edit the restaurant content

Everything is in **`lib/content.ts`**:

| What | Where |
|---|---|
| Name, address, hours, socials | `site` |
| **WhatsApp number** | `site.whatsappNumber` — digits only, e.g. `94771234567` |
| Booking time slots, max guests | `site.bookingSlots`, `site.maxGuests` |
| The 7 story chapters (EN + SI) | `chapters` |
| Menu and prices | `menu` |
| Buttons, form labels, messages | `ui` |

The Sinhala text is a first draft. Have the client proofread it.

## How it's built

- **Next.js 16** with `output: "export"`, so the site is fully static and needs no server
- **React Three Fiber + Drei + Three.js**: every 3D object is made in code (`components/three/`), so there are no model files to download and it stays light on mobile data
- **GSAP ScrollTrigger + Lenis**: smooth scrolling and chapter text reveals
- **Tailwind CSS v4** plus hand-written styles in `app/globals.css`
- **Fonts**: Abhaya Libre (a Sri Lankan serif covering both Sinhala and Latin) and Instrument Sans, self-hosted through Fontsource

### Where to change the 3D story

- `components/three/World.tsx`: the camera path (`CAM` and `LOOK`, one point per chapter), the spice cloud, the stars and the turmeric "dive" transition
- `components/three/Props.tsx`: the lamp, hearth and pot, the banana leaf meal, the table and the guiding ember
- `components/three/Food.tsx`: realistic food: red rice made of individual grains, dhal, chicken curry, gotukola and pol sambol, beetroot, papadam, fried chillies, egg hoppers and clay curry bowls
- `components/three/textures.ts`: clay, wood, stone, banana leaf, woven mat, papadam and hopper textures, all generated in code with no image files
- `components/three/shaders.ts`: the flame, fire and swirling curry

### WhatsApp booking

The form checks the name and date, then opens `https://wa.me/<number>?text=…` with the booking
already typed in the visitor's language. The restaurant confirms the booking in the chat. There's no backend and no cost.

### Accessibility and performance

- Respects "reduce motion": no smooth scroll or flicker, and the camera jumps straight to each stop
- Lower pixel ratio, no antialiasing and a wider field of view on phones
- All story text, the menu and the contact details are real HTML, so search engines can read them

## Ideas for next steps

- Swap the procedural dishes for real `.glb` models (compress with `gltf-transform` using Draco or meshopt)
- Add a short intro loader where the lamp lights up
- Add real food photos to the menu
- Connect a domain and add Google Analytics or Plausible
