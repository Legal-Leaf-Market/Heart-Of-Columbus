// Both Cisco pages share the room's artwork and motion controls.
export const CISCO_PREVIEW = '/preview/ciscos-barber-shop/';
export const ciscoRoomHead = `<link rel="stylesheet" href="${CISCO_PREVIEW}motion/room.css">
<script src="${CISCO_PREVIEW}motion/atmosphere.js" type="module"></script>`;

export function ciscoRoomBackdrop() {
  return `<div class="hero-atmosphere" aria-hidden="true">
    <div class="hero-props">
      ${['shears', 'pole', 'clipper', 'razor'].map((prop) => `<img class="prop prop-${prop}" src="${CISCO_PREVIEW}img/floating-${prop}.webp" width="280" height="280" alt="">`).join('')}
    </div>
    <div class="hero-glints"></div>
    <div class="hero-haze"></div>
  </div>`;
}

export const ciscoRoomControl = '<button class="motion-control" type="button" hidden>Pause effects</button>';
