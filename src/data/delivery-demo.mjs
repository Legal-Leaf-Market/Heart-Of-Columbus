import { detailedPickupSlugs } from './pickup-menus.mjs';

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
