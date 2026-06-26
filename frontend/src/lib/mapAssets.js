/**
 * Map image sources — local files from /public/maps/
 */
const MAP_IMAGES = {
  Mirage:   "/maps/mirage.jpg",
  Inferno:  "/maps/inferno.jpg",
  Nuke:     "/maps/nuke.jpg",
  Overpass: "/maps/overpass.jpg",
  Ancient:  "/maps/ancient.jpg",
  Anubis:   "/maps/anubis.jpg",
  Dust2:    "/maps/dust2.jpg",
};

export function getMapImageSrc(mapName) {
  return MAP_IMAGES[mapName] || "";
}

export const MAP_NAMES = Object.keys(MAP_IMAGES);
