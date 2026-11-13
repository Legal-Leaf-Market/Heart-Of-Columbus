# Acquired source data

Snapshot retrieved November 13, 2026. These are starting datasets, not a current surveyed city model or a promise of complete coverage.

| File | Content | Provenance |
| --- | --- | --- |
| `directory.json` | 931 business/place entries from the existing public Heart directory | https://heartofcolumbus.netlify.app/data/directory.json |
| `landmarks.json` | Landmark records embedded in the public Explore page | https://heartofcolumbus.netlify.app/explore/?view=map |
| `footprints.geojson` | 441 building polygons intersecting the downtown pilot bounding box | Indiana GIS, Building Footprints 2016–2020, layer 0 |
| `roads.json` | 613 OSM ways tagged `highway` in the requested area, including paths/service ways; not 613 distinct streets | OpenStreetMap API bounding-box response |

## Source contracts

The directory's compact fields include `s` slug, `n` name, `c` category, `u` subcategory, `y` type/description, `a` address, `r` neighborhood, `p` public phone, and `l` latitude/longitude when present. Preserve unknown fields and inspect the source site's current adapter for additional meanings. Do not infer an owner, current hours, endorsement or merchant participation from a listing.

Coordinates in `directory.json` and `landmarks.json` are `[latitude, longitude]`. GeoJSON coordinates and `roads.json` coordinates are `[longitude, latitude]`. This order difference is a critical integration detail.

The footprint query used the envelope `west=-85.928, south=39.195, east=-85.914, north=39.209`, input/output WGS84 (EPSG:4326), spatial intersection, and county Bartholomew. It requested object ID, LiDAR year and county. The layer does **not** supply a verified height in this query. Feature geometry may cross the bounding box because intersection was used. Respect polygon holes and multipolygons; validate geometry before extrusion/collision use.

Indiana source: https://gisdata.in.gov/server/rest/services/Hosted/Building_Footprints/FeatureServer/0 . Dataset metadata: https://www.arcgis.com/sharing/rest/content/items/384f2d5041a14c34bd9e807c568784da/info/metadata/metadata.xml?format=default&output=html . Inspect usage/source metadata before redistribution and retain attribution.

Road data was retrieved from `https://www.openstreetmap.org/api/0.6/map?bbox=-85.928,39.195,-85.914,39.209`. It was converted to a compact list containing way ID, name if present, highway type and coordinates. It is not a routing graph, sidewalk survey, street-width dataset or transit network. Ways can extend outside the box. Preserve **© OpenStreetMap contributors** attribution and review the ODbL requirements for a distributed/derived database: https://www.openstreetmap.org/copyright .

## Known factual issues in the site's landmark snapshot

- North Christian retains an older historical description. Use the current research/correction note: cross removed from spire, not whole-spire removal.
- The library record combines I. M. Pei and Henry Moore under a 1969 description. Separate the library (1969) and Large Arch (1971) in historical content.
- Fire Station 4 has a 1968 description in the existing site snapshot while the visitor-center source uses 1967. Research commission/completion/dedication before fixing the date; do not silently assume either describes the same event.
- Chaos I has a 1974/1975 source conflict, flagged in the research briefs.
- Some landmark coordinates are missing or are only broad pin locations. Never invent a model origin, entrance point or accessible route from an address alone.

## Refreshing

Retain source URL, retrieval date, raw source ID, transform version and any conflicts. Import into a staging/review process rather than overwriting owner-reviewed records. Maintain stable internal place IDs across source refreshes. A missing coordinate should produce a visible directory entry and a resolution task, not a fabricated map pin.
