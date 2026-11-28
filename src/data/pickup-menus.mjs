import { readFileSync } from 'node:fs';

// Demo selections transcribed from merchant-published menus. Store names,
// sections and price in cents; the source is shown beside the demo menu.
// Jill’s site project transcribes its printed summer 2026 menu.
const jillsMenu = JSON.parse(readFileSync(new URL('./jills-pickup-menu.json', import.meta.url), 'utf8'));

export const pickupMenus = {
  'jills-diner': { items: jillsMenu, source: 'https://jills-diner.netlify.app/menu/', kind: 'Menu from Jill’s site project' },
  'rohdes-family-diner': {
    source: 'https://www.rohdesfamilydiner.com/view-our-menu',
    kind: 'Selection from the published 2025 breakfast menu',
    items: [
      ['Rise and Shine', 1199, 'Breakfast'], ['Biscuits and Gravy', 749, 'Breakfast'],
      ['Biscuit-less Biscuit & Gravy', 1299, 'Breakfast'], ['French Toast', 899, 'Breakfast'],
    ],
  },
  'donut-central': {
    source: 'https://www.donutcentralcolumbus.com/menus?menu=dinner-menu',
    kind: 'Selection from the public donut and coffee menu',
    items: [
      ['Ring donut', 199, 'Donuts'], ['Bismark', 249, 'Donuts'], ['Glazed Cinnamon Roll', 379, 'Donuts'],
      ['Standard Half Dozen', 1175, 'Boxes'], ['Glazed Dozen', 1850, 'Boxes'],
      ['Small Drip Brew', 249, 'Drinks'], ['Large Drip Brew', 325, 'Drinks'], ['Latte', 549, 'Drinks'],
    ],
  },
  'zaharakos-ice-cream-parlor': {
    source: 'https://zaharakos.com/menu.html',
    kind: 'Selection from the public ice cream parlor menu',
    items: [
      ['Single Scoop', 575, 'Ice cream'], ['Double Scoop', 775, 'Ice cream'], ['Pint to Go', 700, 'Ice cream'],
      ['Brownie Sundae', 1000, 'Sundaes'], ['Tin Roof Sundae', 1000, 'Sundaes'],
      ['Ice Cream Float', 700, 'Fountain'], ['Fountain Soda', 350, 'Fountain'],
    ],
  },
  'columbus-greeks-pizzeria': {
    source: 'https://www.greekspizzeria.com/content/Greeks/menu/GP1027.pdf',
    kind: 'Selection from the published 2025 Columbus menu',
    items: [
      ['Classic Breadsticks (6)', 599, 'Breadsticks'], ['Hot & Sweet Breadsticks (6)', 699, 'Breadsticks'],
      ['Herb Parm Breadsticks (6)', 699, 'Breadsticks'], ['Cinnamon Twists (6)', 699, 'Breadsticks'],
      ['Jumbo Bone-in Wings (6)', 1199, 'Appetizers'], ['Oven Baked Gourmet Meatballs', 999, 'Appetizers'],
      ['Greek Salad', 899, 'Salads'], ['Grilled Chicken Salad', 999, 'Salads'],
    ],
  },
  misora: {
    source: 'https://www.eatmisora.com/menu/',
    kind: 'Selection from the public à la carte menu',
    items: [
      ['Tonkotsu Ramen', 1595, 'Ramen'], ['Miso Ramen', 1595, 'Ramen'], ['Sapporo Ramen', 1595, 'Ramen'],
      ['Chicken Hibachi', 1595, 'Hibachi'], ['Steak Hibachi', 1795, 'Hibachi'], ['Tofu Hibachi', 1295, 'Hibachi'],
      ['California Roll', 595, 'Rolls'], ['Shrimp Tempura Roll', 795, 'Rolls'], ['Avocado Roll', 495, 'Rolls'],
      ['Misora Roll (10 pieces)', 1495, 'Signature rolls'], ['Blossom Roll (8 pieces)', 1495, 'Signature rolls'],
    ],
  },
  'ramen-alley': {
    source: 'https://www.ramen-alley.com/s/order',
    kind: 'Selection from the public pickup menu',
    items: [
      ['Shoyu', 1200, 'Ramen'], ['Tonkotsu', 1450, 'Ramen'], ['Miso', 1300, 'Ramen'],
      ['Spicy Miso', 1400, 'Ramen'], ['Veggie Ramen', 1250, 'Ramen'],
      ['Chashu Don', 825, 'Rice bowls'], ['Tori Don', 825, 'Rice bowls'], ['Tsukune Don', 900, 'Rice bowls'],
      ['Gyoza (5)', 500, 'Sides'], ['Edamame', 350, 'Sides'], ['Mochi Ice Cream', 150, 'Dessert'],
    ],
  },
  'the-garage-pub-and-grill': {
    source: 'https://thegaragepubandgrill.com/food-menu',
    kind: 'Selection from the public food menu',
    items: [
      ['BLT', 1200, 'Lunch'], ['Chicken Salad Sandwich', 1200, 'Lunch'], ['The Loli', 1200, 'Lunch'],
      ['Hummus Wrap', 1200, 'Lunch'], ['Hellcat', 1400, 'Lunch'], ['The Firecracker Rig', 1400, 'Lunch'],
      ['Crinkle Cut Fries', 300, 'Sides'], ['Sweet Potato Waffle Fries', 500, 'Sides'],
      ['Burnout Brownie', 800, 'Dessert'], ['Banana Belt Drive', 600, 'Dessert'],
    ],
  },
  'upland-columbus-pump-house': {
    source: 'https://uplandbeer.com/columbus-menu/',
    kind: 'Selection from the public Columbus food menu',
    items: [
      ['Upland Nachos', 1300, 'Shareables'], ['Spinach Artichoke Dip', 1400, 'Shareables'], ['Soft Pretzel', 1350, 'Shareables'],
      ['Truffle Fries', 1400, 'Shareables'], ['House Smoked Wings', 1650, 'Shareables'],
      ['Hoosier Tenderloin', 1550, 'Upland favorites'], ['Nashville Hot Chicken', 1600, 'Upland favorites'],
      ['Americana Burger', 1650, 'Burgers'], ['Warm Chocolate Brownie', 600, 'Dessert'],
    ],
  },
  'zwanzigz-pizza-and-brewing': {
    source: 'https://www.zwanzigz.com/pizzeria/',
    kind: 'Selection from the public pizzeria menu',
    items: [
      ['Breadsticks', 639, 'Appetizers'], ['Cheese Sticks', 689, 'Appetizers'], ['Garlic Bread', 579, 'Appetizers'],
      ['Say Cheese (10 inch)', 1439, 'Pizza'], ['Say Cheese (14 inch)', 1959, 'Pizza'],
      ['Veggie (14 inch)', 2069, 'Pizza'], ['Five Meat (14 inch)', 2189, 'Pizza'],
      ['Italian Hoagie', 839, 'Hoagies'], ['Spinach Ricotta Calzone', 1039, 'Calzones'],
    ],
  },
};
