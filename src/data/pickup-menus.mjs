import { readFileSync } from 'node:fs';

// Demo selections transcribed from merchant-published menus. Store names,
// sections and price in cents; the source is shown beside the demo menu.
// Jill’s site project transcribes its printed summer 2026 menu.
const jillsItems = JSON.parse(readFileSync(new URL('./jills-pickup-menu.json', import.meta.url), 'utf8'));

// A menu choice group lists the label, followed by options and price changes.
const extra = (label, ...options) => [label, [['None', 0], ...options]];
const multiple = (label, ...options) => [label, options, false, true];
const placement = (label, ...options) => [label, options, false, 'placement'];
const count = (label, counts, ...options) => [label, options, false, 'count', { counts }];
const sizes = (basePrice, ...prices) => [['Size', prices.map((cents, i) => [[10, 14, 16, 18][i] + ' inch', cents - basePrice]), true]];
const tonkotsu = [
  ['Noodles', [['Regular', 0], ['Extra half portion', 100], ['Extra full portion', 200], ['Gluten-free noodles', 100]]],
  extra('Extra meat', ['Extra pork belly', 200], ['Extra chicken', 200], ['Double chicken', 400], ['Extra soboro', 100]),
  ['Egg', [['Regular', 0], ['Extra egg', 150], ['No egg', 0]]],
  multiple('Seasoning', ['Spice bomb', 100], ['Garlic oil', 100], ['Spicy sauce', 50], ['Japanese mayo', 50], ['Fish powder', 50], ['Seaweed flakes', 50]),
  multiple('Extra vegetables', ['Onion', 100], ['Bean sprouts', 100], ['Spinach', 100], ['Corn', 100], ['Mushroom', 100], ['Raw garlic', 100], ['All vegetables', 300], ['Bamboo', 100]),
  multiple('Other extras', ['Tofu', 100], ['Naruto', 50], ['Extra rice', 200], ['Extra broth', 100]),
  multiple('Leave out', ...['Meat', 'Seaweed', 'Onion', 'Spinach', 'Mushroom', 'Corn', 'Red ginger', 'Bamboo',
    'Bean sprouts', 'Tofu', 'Fish powder', 'Garlic oil', 'Naruto'].map(name => [name, 0])),
];
const toppingPrices = [139, 219, 259, 309];
const pizza = [
  ...sizes(1169, 1169, 1589, 1789, 2019),
  ['Sauce', [['Pizza sauce', 0], ['BBQ sauce', 0], ['Ranch', 0], ['Olive oil', 0]], true],
  ['Crust', [['Hand tossed', 0], ['Thin crust', 0]], true],
  placement('Meat toppings', ...['Bacon', 'Beef', 'Grilled chicken', 'Ham', 'Pepperoni', 'Salami', 'Sausage'].map(name => [name, toppingPrices])),
  placement('Vegetable toppings', ...['Banana peppers', 'Black olives', 'Fresh garlic', 'Green olives', 'Green onions',
    'Green peppers', 'Mushrooms', 'Pineapple', 'Jalapeños', 'Roma tomatoes', 'Spinach', 'White onions'].map(name => [name, toppingPrices])),
  placement('Anchovies', ['Anchovies', [300, 300, 550, 550]]),
];

const weekdays = [1, 2, 3, 4, 5];
const window = (days, start, end, label) => ({ days, start, end, label });
const lunch = window(weekdays, 660, 900, 'Monday to Friday, 11 AM to 3 PM');
const ramenLunch = window(weekdays, 660, 840, 'Monday to Friday, 11 AM to 2 PM');
const happyHour = window(weekdays, 900, 1020, 'Monday to Friday, 3 to 5 PM');
const onDay = (day, label) => window([day], 0, 1440, label);
const special = (name, price, availability, choices) => [name, price, 'Specials', choices, availability];
const pick = (label, ...options) => [label, options.map(name => [name, 0]), true];
const flavors = ['Vanilla', 'Chocolate', 'Strawberry', 'Butter pecan', 'Cookies and cream', 'Mint chocolate chip'];
const cone = ['Serving', [['Dish', 0], ['Cake cone', 50], ['Waffle cone', 175], ['Waffle bowl', 175]], true];
const sauce = pick('Sauce', 'Hot fudge', 'Caramel', 'Marshmallow', 'Peanut butter', 'Pineapple', 'Strawberry');
const sundaeToppings = multiple('Extra toppings', ...['Sprinkles', 'Peanuts', 'Oreo bits', 'Mini chocolate chips'].map(name => [name, 75]));
const noodleProtein = [pick('Protein', 'Chashu pork', 'Chicken', 'Shrimp tempura')];
const hibachiSides = [pick('Starter', 'Salad', 'Miso soup'), ['Rice', [['Steamed rice', 0], ['Fried rice', 100]], true]];
const donutBox = (difference) => [['Box size', [['Half dozen', 0], ['Dozen', difference]], true]];
const standardSide = ['Side', [['Crinkle cut fries', 0], ['Superfood slaw', 0], ['Cottage cheese', 0], ['Chips and salsa', 0],
  ['Onion rings', 200], ['Sweet potato waffle fries', 200]], true];
const garageBread = pick('Bread or wrap', 'White bread', 'Wheat bread', 'Wrap');
const jillsPotatoes = pick('Potatoes', 'Hash rounds', 'Home fries');
const jillsTenderloin = [pick('Preparation', 'Grilled', 'Breaded')];
const jillsChoices = {
  "Jill's Big Breakfast": [
    pick('Entrée', 'Country fried steak', 'Grilled pork tenderloin'), jillsPotatoes,
    pick('Side', 'Pancake', 'Half order of biscuits and gravy'),
  ],
  'Half Order, Eggs, Meat & Potatoes': [pick('Meat', 'Bacon', 'Sausage patties', 'Sausage links'), jillsPotatoes],
  'Pork Tenderloin': jillsTenderloin,
  Tenderloin: jillsTenderloin,
};
const jillsMenu = jillsItems.map(row => Object.hasOwn(jillsChoices, row[0]) ? [...row, jillsChoices[row[0]]] : row);
const lunchAddon = (label, options, cents) => [label, [['None', 0], ...options.map(name => [name, cents])], false, false, { schedule: ramenLunch }];
const lunchTonkotsu = [
  ...tonkotsu,
  lunchAddon('Mini side', ['Pork gyoza', 'Vegetable gyoza', 'Edamame', 'Kimchi', 'Rice'], 100),
  lunchAddon('Mini bowl', ['Pork curry', 'Vegetable curry', 'Chashu mayo don', 'Gyudon'], 300),
];
const includedSide = pick('Side', 'Brewery fries', 'Broad Ripple chips', 'Potato salad', 'Blue cheese coleslaw');
const uplandBun = ['Bun', [['Regular', 0], ['Vegan bun', 250], ['Gluten-free bun', 250]], true];
const addUpToThree = label => [label, [['None', 0], ['One extra', 300], ['Two extra', 600], ['Three extra', 900]]];
const sundaeFlight = scoops => [
  ...Array.from({ length: scoops }, (_, i) => pick('Scoop ' + (i + 1), ...flavors)),
  ...Array.from({ length: 3 }, (_, i) => ['Sauce ' + (i + 1), sauce[1], true]),
];

export const detailedPickupSlugs = [
  'ramen-alley', 'zwanzigz-pizza-and-brewing', 'donut-central', 'zaharakos-ice-cream-parlor',
  'misora', 'the-garage-pub-and-grill', 'upland-columbus-pump-house',
];

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
      ['Standard Box', 1175, 'Boxes', donutBox(975)], ['Glazed Box', 1175, 'Boxes', donutBox(675)],
      ['Mixed Box', 1275, 'Boxes', donutBox(1175)],
      ['Pick Your Standard Box', 1175, 'Boxes', [...donutBox(975),
        count('Choose donuts', [6, 12], ['Cake rings', 0], ['Yeast rings', 0])]],
      ['Pick Your Mixed Dozen', 2450, 'Boxes', [
        count('Choose donuts', [12], ['Cake rings', 0], ['Yeast rings', 0], ['Filled Bismarks', 0],
          ['Long Johns or twists', 75], ['Glazed cinnamon rolls', 145], ['Caramel cinnamon rolls', 145], ['Nutella Bismarks', 145])]],
      ['Donut Holes', 249, 'Boxes', [...donutBox(210), pick('Coating', 'Glazed', 'Cinnamon sugar')]],
      ['Apple Fritter', 449, 'Specialties', null, window([5, 6], 0, 1440, 'Friday and Saturday')],
      ['Do’Sant', 449, 'Specialties', null, window([5, 6], 0, 1440, 'Friday and Saturday')],
      ['Small Drip Brew', 249, 'Drinks'], ['Large Drip Brew', 325, 'Drinks'], ['Latte', 549, 'Drinks'],
    ],
  },
  'zaharakos-ice-cream-parlor': {
    source: 'https://zaharakos.com/menu.html',
    kind: 'Selection from the public ice cream parlor menu',
    items: [
      ['Single Scoop', 575, 'Ice cream', [pick('Flavor', ...flavors), cone]],
      ['Double Scoop', 775, 'Ice cream', [pick('First scoop', ...flavors), pick('Second scoop', ...flavors), cone]],
      ['Pint to Go', 700, 'Ice cream'],
      ['Single Scoop Sundae', 625, 'Sundaes', [pick('Flavor', ...flavors), sauce, sundaeToppings]],
      ['Brownie Sundae', 1000, 'Sundaes', [pick('First scoop', ...flavors), pick('Second scoop', ...flavors)]],
      ['Tin Roof Sundae', 1000, 'Sundaes'],
      ['Split with a Twist', 1200, 'Sundaes', sundaeFlight(3)],
      ['The Big Z', 1800, 'Sundaes', sundaeFlight(5)],
      ['Ice Cream Float', 700, 'Fountain'], ['Fountain Soda', 350, 'Fountain'],
      special('Wednesday Waffle Cone', 550, onDay(3, 'Wednesday'), [
        ['Scoops', [['One scoop', 0], ['Two scoops', 150]], true]]),
      special('Thursday Tin Roof Sundae', 800, onDay(4, 'Thursday')),
      special('Friday Float', 550, onDay(5, 'Friday')),
      special('Saturday Strawberry Shortcake Sundae', 800, onDay(6, 'Saturday')),
      special('Sunday Sundae', 450, onDay(0, 'Sunday'), [
        ['Scoops', [['One scoop', 0], ['Two scoops', 150]], true], sauce]),
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
      ['Tonkotsu Ramen', 1595, 'Ramen', noodleProtein], ['Miso Ramen', 1595, 'Ramen', noodleProtein], ['Sapporo Ramen', 1595, 'Ramen', noodleProtein],
      ['Chicken Hibachi', 1595, 'Hibachi', hibachiSides], ['Steak Hibachi', 1795, 'Hibachi', hibachiSides], ['Tofu Hibachi', 1295, 'Hibachi', hibachiSides],
      ['Chicken Teriyaki', 1595, 'Teriyaki', hibachiSides], ['Tofu Teriyaki', 1395, 'Teriyaki', hibachiSides],
      ['Salmon Teriyaki', 1795, 'Teriyaki', hibachiSides], ['Shrimp Hibachi', 1795, 'Hibachi', hibachiSides],
      ['California Roll', 595, 'Rolls'], ['Shrimp Tempura Roll', 795, 'Rolls'], ['Avocado Roll', 495, 'Rolls'],
      ['Misora Roll (10 pieces)', 1495, 'Signature rolls'], ['Blossom Roll (8 pieces)', 1495, 'Signature rolls'],
    ],
  },
  'ramen-alley': {
    source: 'https://www.ramen-alley.com/s/order',
    kind: 'Selection from the public pickup menu',
    items: [
      ['Shoyu', 1200, 'Ramen'], ['Tonkotsu', 1450, 'Ramen', lunchTonkotsu], ['Miso', 1300, 'Ramen'],
      ['Spicy Miso', 1400, 'Ramen'], ['Veggie Ramen', 1250, 'Ramen'],
      ['Chashu Don', 825, 'Rice bowls'], ['Tori Don', 825, 'Rice bowls'], ['Tsukune Don', 900, 'Rice bowls'],
      ['Gyoza (5)', 500, 'Sides'], ['Edamame', 350, 'Sides'], ['Mochi Ice Cream', 150, 'Dessert'],
    ],
  },
  'the-garage-pub-and-grill': {
    source: 'https://thegaragepubandgrill.com/food-menu',
    kind: 'Selection from the public food menu',
    items: [
      ['BLT', 1200, 'Lunch', [garageBread, standardSide], lunch],
      ['Chicken Salad Sandwich', 1200, 'Lunch', [garageBread, standardSide], lunch],
      ['The Loli', 1200, 'Smashburgers', [standardSide, addUpToThree('Extra patties'), addUpToThree('Extra cheese slices')]], ['Hummus Wrap', 1200, 'Lunch', [standardSide], lunch],
      ['Hellcat', 1400, 'Lunch', [standardSide], lunch], ['The Firecracker Rig', 1400, 'Lunch', [standardSide], lunch],
      ['Crankshaft Cornribs', 1000, 'Starters', [pick('Seasoning', 'Classic', 'Nashville hot', 'Mexican street corn')]],
      ['Lube Rack & Pretzel Stack', 1000, 'Starters', [pick('Dip', 'Beer cheese', 'Queso')]],
      ['Crinkle Cut Fries', 300, 'Sides'], ['Sweet Potato Waffle Fries', 500, 'Sides'],
      ['Burnout Brownie', 800, 'Dessert'], ['Banana Belt Drive', 600, 'Dessert'],
    ],
  },
  'upland-columbus-pump-house': {
    source: 'https://uplandbeer.com/columbus-menu/',
    kind: 'Selection from the public Columbus food menu',
    items: [
      ['Upland Nachos', 1300, 'Shareables', [
        extra('Add a topping', ['Guacamole', 200], ['Sour cream', 200]),
        extra('Add a protein', ['Spicy beef', 400], ['Spicy chicken', 400], ['BBQ pulled pork', 400], ['Southwest tofu', 400])]], ['Spinach Artichoke Dip', 1400, 'Shareables'], ['Soft Pretzel', 1350, 'Shareables'],
      ['Truffle Fries', 1400, 'Shareables'], ['House Smoked Wings', 1650, 'Shareables'],
      ['Hoosier Tenderloin', 1550, 'Upland favorites', [includedSide, uplandBun]],
      ['Nashville Hot Chicken', 1600, 'Upland favorites', [includedSide, uplandBun]],
      ['Americana Burger', 1650, 'Burgers', [includedSide, uplandBun]],
      ['Classic Burger', 1550, 'Burgers', [
        pick('Cheese', 'American', 'Cheddar', 'Swiss', 'Smoked gouda', 'Jalapeño pepper jack'),
        ['Patty', [['Beef', 0], ['Grilled chicken', 0], ['Fried chicken', 0], ['Black bean', 0], ['Bison', 300], ['Impossible', 300]], true],
        includedSide, uplandBun]], ['Warm Chocolate Brownie', 600, 'Dessert'],
      special('Happy Hour Chicharrones', 500, happyHour),
      special('Happy Hour Mini Brownie', 400, happyHour),
    ],
  },
  'zwanzigz-pizza-and-brewing': {
    source: 'https://www.zwanzigz.com/pizzeria/',
    kind: 'Selection from the public pizzeria menu',
    items: [
      ['Breadsticks', 639, 'Appetizers'], ['Cheese Sticks', 689, 'Appetizers'], ['Garlic Bread', 579, 'Appetizers'],
      ['Say Cheese', 1439, 'Pizza', sizes(1439, 1439, 1959, 2339, 2609)],
      ['Veggie', 1499, 'Pizza', sizes(1499, 1499, 2069, 2429, 2819)],
      ['Five Meat', 1609, 'Pizza', sizes(1609, 1609, 2189, 2589, 3019)],
      ['Lasagna Pizza', 1499, 'Pizza', sizes(1499, 1499, 2069, 2479, 3019)],
      ['Build Your Own Pizza', 1169, 'Pizza', pizza],
      special('Legendary Lunch Combo', 649, window(weekdays, 660, 810, 'Monday to Friday, 11 AM to 1:30 PM')),
      ['Italian Hoagie', 839, 'Hoagies'], ['Spinach Ricotta Calzone', 1039, 'Calzones'],
    ],
  },
};
