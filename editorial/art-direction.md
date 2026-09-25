# Journal art: role, crop, and provenance

## Use and crop

The 14 journal illustrations are atmospheric cover art, not documentary photographs or evidence for an article’s factual claims. The archived [journal art manifest](../../editorial/journal-art-manifest.json) records 1536 × 1024 source renders and 768-pixel-wide derivatives. The current feature hero and story card both use a 3:2 frame, matching the landscape source ratio; no per-image `crop` or `focalPoint` is recorded in the media registry. Keep the full composition at that ratio. If a future surface crops to a portrait or square, preserve the prompt’s named focal object and recheck the crop at its rendered size instead of assuming centered `cover` will work.

| Asset | Editorial role and crop focus |
| --- | --- |
| `cincinnati-market-to-music` | Cincinnati market / OTR route cover. Keep the green market entrance central; the broad tree and stalls are secondary context. |
| `dayton-made-to-fly` | Dayton aviation workshop. Keep the model biplane and bicycle wheel together so the bicycle-to-flight connection remains legible. |
| `cuyahoga-slow-day` | Cuyahoga Valley slow-walk cover. Preserve the waterfall and approaching boardwalk in the same frame. |
| `sandusky-play-day` | Sandusky lake-and-park day. Keep the bench, sailboat, and distant coaster silhouettes; avoid a crop that makes the park dominate the lake. |
| `brass-whistle` | Whistle-making still life. Keep the whistle, lanyard, and metal blank visible; the whistle is the factual focal object. |
| `rookwood-clay` | Cincinnati pottery still life. Keep vase, clay, and shaping tool together; do not crop this into a claim about a specific historic Rookwood object. |
| `toledo-glass` | Toledo glassmaking. Preserve both vessels and the quiet furnace cue; the picture is illustrative, not a photograph of the museum’s hot shop. |
| `akron-rubber` | Akron rubber story. Keep the tire and sheet of rubber visible; it is an editorial object scene, not a company or factory image. |
| `cincinnati-chili` | Cincinnati food cover. Center the three-way plate and retain the uncovered diner context; the image is not a menu photograph. |
| `buckeye-sweets` | Buckeye candy / state-symbol story. Preserve the exposed peanut-butter circles that distinguish the confection in the prompt. |
| `west-side-market-table` | Cleveland market interior. Keep the vaulted aisle and stalls; do not imply it depicts a verified exact market bay. |
| `library-afternoon` | Library reading and archives. Keep the open book, chair/table, and window together; it is not a depiction of a particular Columbus branch. |
| `athens-campus-day` | Athens campus walk. Keep the green, path, and red-brick academic building; the prompt says “inspired by Cutler Hall,” not a documentary architectural rendering. |
| `community-garden-season` | Shared garden season. Keep the beds, path, and watering can; the manifest identifies this as a redraw using a composition input and a separate style reference. |

The 768-pixel files are responsive size variants, not alternate crops. The archived manifest contains no approved alternate aspect ratios. The existing cover art is reused by the new materials, sound, library, and street draft bundles where a dossier needs a matching scene; those associations do not change what the image depicts.

## Character art states

The character images are separate from the 14-image journal manifest. The current content renderer maps `explore` to `travel`, `make` to `industry`, `culture` to `culture`, and `live` to `life` in `src/components/ContentBody.vue`. The four transparent chapter images use a consistent full-body design, with the pose carrying the distinction: `travel` holds a camera and opens a hand toward the reader; `industry` holds a silver object; `culture` brings a microphone to the mouth and gestures outward; `life` holds books and raises a welcoming hand. They read as invitation/explanation poses, not as reports of an actual person at the location. Current styling crops these character figures top-aligned inside a narrow portrait panel, so hands, camera, microphone, and books need to stay inside the safe crop. There is no state/pose manifest for these files in the archived journal-art manifest; these descriptions are visual inspection plus code mapping.

## Credit and rights evidence

The archived manifest identifies the journal-image generator as “Built-in imagegen,” records prompts and source PNG paths, and says the industrial landscape image was used as a user-approved style reference on 2026-09-24. For `community-garden-season`, it records a composition input and instructs the generator to use a separate image as the style reference. That is useful provenance for the production process; it does not establish a third-party source license, public-domain status, or blanket reuse rights. The current `src/content/data/media.json` still marks every journal image’s provenance and rights as unverified. Keep that status unless the project has additional rights documentation; do not invent an artist credit or a license. The character files have no provenance entry in this archived manifest, so their credit and rights need separate records before reuse outside this site.

When adding captions, “Illustration” is accurate for the journal covers. Keep all generated scenes out of source roles: cite maps, artifacts, collections, and reporting separately when a factual detail depends on them.
