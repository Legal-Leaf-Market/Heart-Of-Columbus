// Shared with the Netlify function, which does not load storefront menu files.
export const detailedPickupSlugs = [
  'ramen-alley', 'zwanzigz-pizza-and-brewing', 'donut-central', 'zaharakos-ice-cream-parlor',
  'misora', 'the-garage-pub-and-grill', 'upland-columbus-pump-house',
];

export const deliveryPilotSlugs = new Set(['jills-diner', ...detailedPickupSlugs]);

export const deliveryDemo = {
  dropoffs: {
    downtown: 'Downtown sample address',
    east: 'East Columbus sample address',
  },
  drivers: {
    alex: 'Alex',
    sam: 'Sam',
  },
  windows: {
    soon: 'Next available run',
    later: 'Later today',
    tomorrow: 'Tomorrow',
  },
  reasons: {
    recipient_unavailable: 'Recipient unavailable',
    address_inaccessible: 'Could not reach the door',
  },
};
