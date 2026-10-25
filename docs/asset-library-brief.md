# Heart of Columbus: asset library brief

Paste this whole file into an image-making chat. Attach these existing files
from `public/art/` as style references: `cat-auto.png`, `cat-restaurants.png`,
`empty-search.png`, `empty-saved.png`, `float-courthouse.png`,
`owners-storefront.png`. Everything new must look like it came from the same
hand.

## What this is for

Heart of Columbus is a friendly local directory of about 930 independent
businesses in Columbus, Indiana. The site is cream paper, chunky black
outlines and bold flat color, a little retro, a little playful. The art makes
each kind of business easy to spot on a card at a glance.

## Style rules (all assets)

- **Flat vector look.** Solid fills, no gradients, no textures, no photo
  realism, no 3D shading. One optional flat highlight stripe in white.
- **Thick ink outline** on every shape, color `#1b1a17`, rounded joins. At
  256 px the outline is about 8 px; scale it with the canvas.
- **Palette only:**

  | Name | Hex | Use |
  | --- | --- | --- |
  | Ink | `#1b1a17` | outlines, small details |
  | Red | `#c8232c` | the brand color, main accents |
  | Mustard | `#f2b33d` | warm fills, sun, stars |
  | Sky | `#8ec5ea` | glass, water, cool fills |
  | Ice | `#c3dbea` | light glass, steam, bubbles |
  | Navy | `#1e2a4a` | dark objects |
  | Pink | `#ff2e88` | pops of fun |
  | Sage | `#739a7c` | ground, grass |
  | Green | `#2b6b3a` | leaves, plants |
  | Paper | `#fbf5f0` | light fills |
  | White | `#ffffff` | light fills, highlights |
  | Steel | `#aab4bd` | metal |
  | Brown | `#8a4b2a` | wood, leather |

- **Transparent background** (PNG with alpha). No background color, no frame,
  no circle behind the subject.
- **No text, letters, numbers or logos** anywhere in the image.
- **Never depict a real business**, storefront, sign, brand or person. Generic
  objects only. Landmarks are fine only where named below.
- Little accent marks are welcome but sparing: a small red or mustard
  five-point star, a tiny sparkle, as in the references.
- Subject centered, filling about 80% of the canvas, with even margins so it
  never touches an edge.
- Keep files small: under 25 KB for 256 px icons, under 40 KB for 360 px
  pieces. Run them through a PNG optimizer (TinyPNG, `oxipng`, `pngquant`).

## 1. Empty states (360 x 270, transparent PNG)

These sit centered above a short message when there is nothing to show. Same
size and feel as `empty-search.png` and `empty-saved.png`: one simple object on
a short swoosh of ground, lots of breathing room.

| File | Subject | Shown when |
| --- | --- | --- |
| `empty-plot.png` | An empty lot: a short strip of sage grass with a mustard ground line, a few white picket-fence posts on the left, a wooden post holding a blank white sign with a big ink question mark (the one allowed glyph), a small green sprout, a mustard sun, one white cloud | The "page not found" page |
| `empty-cart.png` | An empty woven mustard shopping basket with a red rim and a tall handle, a couple of small stars around it | The shopping cart is empty |
| `empty-ticket.png` | A white paper ticket stub, slightly tilted, with a dashed tear line and a big ink question mark on the stub end, small stars around it | A pickup code isn't found |

## 2. Business-type covers (256 x 256, transparent PNG)

One spot illustration per business type, named `cover-<type>.png`. It sits
centered on the colored, patterned top of every business card (about 84 px
tall) and large on each business page (about 170 px). It replaces the emoji
shown there today, so each one needs to read at small size: one clear object,
bold silhouette, little detail.

The category color is the card behind the art, so lean on the palette rather
than matching the card.

| File | Type | Draw |
| --- | --- | --- |
| `cover-mexican.png` | Mexican & Latin | A taco: mustard shell, green lettuce ruffle, red tomato bits |
| `cover-diners.png` | Diners & Grills | A navy frying pan with a sunny-side-up egg |
| `cover-pizza.png` | Pizza & Italian | A pizza slice with pepperoni, crust on top |
| `cover-asian.png` | Asian & Indian | A red noodle bowl with a white band, mustard noodles, chopsticks |
| `cover-bbq-trucks.png` | BBQ, Trucks & Catering | A sky-blue food truck with a red awning and service window |
| `cover-coffee-sweets.png` | Coffee, Bakeries & Treats | A pink-frosted donut with sprinkles, a small steaming coffee cup behind it |
| `cover-bars.png` | Bars, Breweries & Wine | A mustard beer mug with white foam |
| `cover-barbers.png` | Barbershops | A barber pole: red and sky stripes, navy caps |
| `cover-salons.png` | Hair Salons | A pink hair dryer with a puff of air |
| `cover-nails.png` | Nail Salons | A pink nail polish bottle with a navy cap |
| `cover-spa.png` | Spa, Skin & Massage | Stacked smooth stones (steel, ice, sage) with one green leaf |
| `cover-tattoo.png` | Tattoo & Piercing | A classic tattoo-flash red heart with a blank white banner across it |
| `cover-boutiques.png` | Boutiques & Bridal | A pink dress on a hanger |
| `cover-gifts.png` | Gifts, Books & Art | A stack of three books (red, sky, mustard) with a bookmark ribbon |
| `cover-antiques.png` | Antiques & Thrift | A red vintage armchair with wooden legs |
| `cover-home-garden.png` | Flowers, Home & Garden | A red clay pot with three flowers (pink, sky, mustard) |
| `cover-markets.png` | Markets & Specialty Food | A mustard market basket with an apple and a head of greens |
| `cover-hobbies.png` | Sports, Games & Hobbies | Two tumbling dice, one white with red pips, one red with white pips |
| `cover-smoke.png` | Smoke & Vape | A navy vape pen with a soft ice-blue cloud |
| `cover-dental.png` | Dentists | A white tooth with a sparkle |
| `cover-chiro.png` | Chiropractic & Therapy | A white bone, slightly tilted |
| `cover-eye-ear.png` | Eye & Hearing | A pair of navy glasses with sky lenses |
| `cover-counseling.png` | Counseling | Two overlapping speech bubbles, sky and pink, a small white heart |
| `cover-clinics.png` | Clinics & Care | A small white clinic building with a red cross sign |
| `cover-fitness.png` | Gyms, Studios & Martial Arts | A dumbbell: navy and red plates on a steel bar |
| `cover-pets.png` | Vets, Groomers & Boarding | A friendly mustard dog face with floppy brown ears |
| `cover-hvac-plumbing.png` | HVAC & Plumbing | A steel pipe wrench on a short red pipe fitting |
| `cover-electric.png` | Electricians | A mustard lightning bolt |
| `cover-contractors.png` | Contractors & Remodeling | A mustard hard hat |
| `cover-lawn.png` | Lawn, Landscape & Tree | A round green tree with a brown trunk |
| `cover-home-help.png` | Cleaning, Storage & More | A sky spray bottle with a pink trigger and a few bubbles |
| `cover-laundry.png` | Cleaners & Laundry | A white front-loading washer with a sky-blue door |
| `cover-auto-repair.png` | Auto Repair | A steel hex nut with a red wrench crossing it |
| `cover-tires-body.png` | Tires, Body & Glass | A tire with a steel hubcap |
| `cover-used-cars.png` | Used Cars & Powersports | A red car in side view with a blank mustard price tag |
| `cover-detail-tow.png` | Detailing, Tint & Towing | A mustard car-wash sponge with ice-blue bubbles |
| `cover-legal.png` | Lawyers | Mustard scales of justice |
| `cover-accounting.png` | Accounting & Tax | A navy calculator with white keys |
| `cover-insurance.png` | Insurance | A navy shield with a white check mark |
| `cover-real-estate.png` | Real Estate & Title | A white house with a red roof and a blank mustard yard sign |
| `cover-finance.png` | Finance & Wealth | Three bars (sky, mustard, red) with a green arrow going up |
| `cover-creative.png` | Marketing, Print & Photo | A navy camera with a sky lens |
| `cover-tech.png` | Tech & IT | A navy laptop with a sky screen showing `< >` brackets drawn as lines |
| `cover-business.png` | Consulting & Business | A brown briefcase with a mustard clasp |
| `cover-events.png` | Venues, DJs & Rentals | Three balloons (red, sky, mustard) with strings, a little confetti |
| `cover-childcare.png` | Childcare & Schools | Three stacked toy blocks (red, sky, mustard) with a star, heart and circle on them |
| `cover-lessons.png` | Dance & Music Lessons | A pair of navy eighth notes |
| `cover-things-to-do.png` | Entertainment, Golf & Stays | A golf green with a red flag and a white ball |
| `cover-machining.png` | Machining & Fabrication | Two interlocking gears, steel and red |
| `cover-construction.png` | Construction & Engineering | A sky-blue blueprint sheet with white grid lines and a mustard drafting triangle |
| `cover-logistics.png` | Logistics & Supply | A closed cardboard box (mustard and tan) with tape |

## How to hand them over

- Export at exactly the sizes above, transparent PNG, named exactly as listed.
- Drop them into `public/art/` in the repo. Covers turn on by themselves: the
  build shows `cover-<type>.png` wherever it exists and the emoji wherever it
  doesn't, so they can arrive a few at a time.
- The three empty states need a one-line code change each to switch over
  from `empty-search.png`. Ask Claude Code to wire them once they're in.
- Check a batch side by side with the reference files before committing. If
  one looks heavier, brighter or more detailed than its neighbors, redo it.
