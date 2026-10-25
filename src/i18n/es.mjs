// Spanish UI strings and translations of sourced facts. Business names,
// addresses and the names of events and places stay as they are. A fluent
// speaker should review these before the Spanish pages launch; until then
// every Spanish page says so (REVIEW_NOTE). tests/i18n.test.mjs fails if a
// fact on a translated page has no Spanish version here.

export const REVIEW_NOTE = 'Traducción en revisión. Si ve un error, avísenos desde la página para dueños.';

export const UI = {
  skip: 'Saltar al contenido',
  searchPlaceholder: 'Tacos, barberos, plomeros, calle 25…',
  searchLabel: 'Buscar negocios de Columbus',
  nav: { visit: 'Visitar', explore: 'Explorar', order: 'Pedir y reservar', map: 'Mapa', areas: 'Vecindarios', saved: 'Guardados' },
  switchTo: 'English',
  footerTag: 'Negocios independientes de Columbus, Indiana. Sin cadenas, sin franquicias, sin comisiones de apps.',
  footerSmall: 'Una vista previa. Los datos vienen de listados públicos y pueden cambiar; llame antes de ir. Sin afiliación con los negocios listados.',
  browse: 'Explorar', more: 'Más', aroundTown: 'Por la ciudad', owners: 'Dueños',
  links: { visit: 'Planee su visita', free: 'Gratis en Columbus', holidays: 'Compras locales en las fiestas', credits: 'Créditos de fotos', claim: 'Reclame su listado', pickup: 'Pedidos para recoger', direct: 'Pedir, reservar y comprar directo' },
  home: 'Inicio',
};

export const CATEGORY = {
  restaurants: 'Restaurantes', 'coffee-sweets': 'Café y dulces', bars: 'Bares y cervecerías', beauty: 'Belleza y cuidado personal', shopping: 'Tiendas',
  health: 'Salud y bienestar', fitness: 'Ejercicio', pets: 'Mascotas', 'home-services': 'Servicios para el hogar', auto: 'Autos', pros: 'Servicios profesionales',
  events: 'Eventos y bodas', kids: 'Niños y clases', 'things-to-do': 'Qué hacer', makers: 'Fabricantes e industria',
};

export const VISIT = {
  title: 'Planee su visita | Heart of Columbus',
  description: 'Visitar Columbus, Indiana: el Centro de Visitantes, los tours de arquitectura, cómo llegar y moverse, y el Distrito Social del centro, con la fuente de cada dato.',
  kicker: 'Planee su visita',
  h1a: '¿Viene a Columbus?', h1b: 'Empiece aquí.',
  lede: 'Por dónde empezar, cómo ver la arquitectura, cómo llegar y moverse, y el Distrito Social del centro. Luego encuentre lugares independientes para comer, comprar y pasear en el resto del sitio.',
  note: (official, date) => `Heart of Columbus no es la oficina de turismo. Para tours, eventos e información oficial, visite <a href="${official}" target="_blank" rel="noopener">Visit Columbus Indiana</a>. Cada dato enlaza a su fuente, revisada el ${date}.`,
  jump: { 'visitors-center': 'Centro de Visitantes', tours: 'Tours de arquitectura', 'getting-here': 'Cómo llegar', 'getting-around': 'Cómo moverse', 'social-district': 'Distrito Social', 'call-ahead': 'Llame antes', '/visit/#your-way': 'Ideas de viaje (en inglés)', '/free/': 'Gratis en Columbus', '/holidays/': 'Compras en las fiestas' },
  vc: { kicker: 'Empiece aquí', name: 'Centro de Visitantes de Columbus', downtown: 'centro', hours: 'Horario y días festivos', listing: 'Su listado aquí' },
  tours: { kicker: 'Arquitectura', title: 'Vea los edificios', lead: 'Columbus es conocida por su arquitectura moderna. El Centro de Visitantes ofrece los tours guiados oficiales.', btn: 'Horarios, precios y boletos', near: 'Lugares cercanos en el centro' },
  here: { kicker: 'Cómo llegar', title: 'En auto y en avión', btn: 'Direcciones completas' },
  around: { kicker: 'Cómo moverse', title: 'Autobús, sendero y a pie', routes: 'Rutas de autobús', trails: 'Parques y senderos', map: 'Nuestro mapa', near: 'Abierto cerca de mí' },
  dora: { kicker: 'Noches en el centro', name: 'Distrito Social del centro de Columbus', lead: 'La ciudad tiene un área designada al aire libre en el centro, donde puede caminar entre lugares con una bebida.', city: 'La página de la ciudad', maps: ['Mapa del límite', 'Mapa de negocios designados'] },
  ahead: { kicker: 'Antes de ir', title: 'Llame antes', items: [
    'Los horarios en Heart of Columbus vienen del listado público de cada negocio y pueden cambiar, sobre todo en días festivos. Una llamada rápida le ahorra el viaje.',
    'No tenemos afiliación con los negocios listados, y nada aquí le reserva una mesa o un tour.',
    '¿Ve un dato incorrecto? Los dueños pueden corregir su listado desde <a href="/owners/">la página para dueños</a>.',
  ], open: 'Vea qué está abierto ahora', calendar: 'Calendario oficial de eventos' },
  english: 'Estas páginas siguen en inglés por ahora: los listados de negocios, las ideas de viaje y los eventos.',
  more: 'Más en inglés',
};

// Spanish for each sourced fact, keyed by the English text in src/data/visit.mjs.
export const FACTS = {
  'Open Monday to Saturday, 10 AM to 5 PM. Closed Mondays in January and February. Holiday hours are posted on their site.':
    'Abierto de lunes a sábado, de 10 AM a 5 PM. Cerrado los lunes de enero y febrero. El horario de días festivos está en su sitio.',
  'Free parking. The lot is just past the building on Franklin Street, which runs one way north; visitor spaces are at the south end of the lot.':
    'Estacionamiento gratis. El lote está justo después del edificio en Franklin Street, que es de un solo sentido hacia el norte; los espacios para visitantes están en el extremo sur del lote.',
  'Staff on the first floor help plan a visit and pick a tour. Maps, brochures and city guides are free to take.':
    'El personal del primer piso ayuda a planear la visita y elegir un tour. Los mapas, folletos y guías de la ciudad son gratis.',
  'Free videos about Columbus, shown any time, and a Dale Chihuly yellow neon chandelier.':
    'Videos gratis sobre Columbus, a cualquier hora, y un candelabro de neón amarillo de Dale Chihuly.',
  'A gift shop with work by local and regional artists.':
    'Una tienda de regalos con obras de artistas locales y regionales.',
  'Architectural Highlights by shuttle: about 2 hours. No children under 6.':
    'Architectural Highlights en minibús: unas 2 horas. No se admiten niños menores de 6 años.',
  'Miller House and Garden: about 90 minutes, ages 10 and up. There is no public access at the house except on the tour.':
    'Miller House and Garden: unos 90 minutos, desde los 10 años. No hay acceso público a la casa fuera del tour.',
  'Iconic Columbus Walking Tour: about 90 minutes on foot.':
    'Iconic Columbus Walking Tour: unos 90 minutos a pie.',
  'All three start and end at the Visitors Center. Tours regularly sell out, so the Visitors Center recommends reserving ahead.':
    'Los tres empiezan y terminan en el Centro de Visitantes. Los tours suelen agotarse, así que el Centro de Visitantes recomienda reservar con anticipación.',
  'On your own: up to 82 stops on the Downtown and City loops, with a printed stop guide sold at the Visitors Center, Viewpoint Books and Hotel Indigo.':
    'Por su cuenta: hasta 82 paradas en los recorridos Downtown y City, con una guía impresa que se vende en el Centro de Visitantes, Viewpoint Books y Hotel Indigo.',
  'Free self-guided bike tour maps are available at the Visitors Center.':
    'En el Centro de Visitantes hay mapas gratis para recorrer la ciudad en bicicleta por su cuenta.',
  'By car on I-65 (from Indianapolis, Louisville or Bloomington): take exit 68 and follow State Road 46 east into Columbus.':
    'En auto por la I-65 (desde Indianápolis, Louisville o Bloomington): tome la salida 68 y siga la State Road 46 hacia el este hasta Columbus.',
  'From Cincinnati: I-74 to the Greensburg exit (134A), then State Road 46 west to Columbus.':
    'Desde Cincinnati: la I-74 hasta la salida de Greensburg (134A), luego la State Road 46 hacia el oeste hasta Columbus.',
  'The Indianapolis airport is about an hour’s drive, and Louisville’s about an hour and a half. No shuttles or taxis run from the Indianapolis airport, so the Visitors Center suggests renting a car.':
    'El aeropuerto de Indianápolis queda a una hora en auto, y el de Louisville a una hora y media. No hay minibuses ni taxis desde el aeropuerto de Indianápolis, así que el Centro de Visitantes sugiere rentar un auto.',
  'ColumBUS, the city bus, is free to ride.':
    'ColumBUS, el autobús de la ciudad, es gratis.',
  'Five fixed routes run Monday to Friday, 6 AM to 8 PM, and Saturday, 8 AM to 5 PM. No Sunday service is listed.':
    'Cinco rutas fijas funcionan de lunes a viernes, de 6 AM a 8 PM, y los sábados, de 8 AM a 5 PM. No aparece servicio los domingos.',
  'The Columbus Transit Depot is at 850 Lindsey Street. Questions: (812) 376-2506.':
    'La terminal Columbus Transit Depot está en 850 Lindsey Street. Preguntas: (812) 376-2506.',
  'The People Trail: the parks department maintains over 23 miles of paved trail linking the city’s parks.':
    'El People Trail: el departamento de parques mantiene más de 23 millas de sendero pavimentado que conecta los parques de la ciudad.',
  'The Visitors Center suggests Mill Race Park as a place to start on the trail.':
    'El Centro de Visitantes sugiere Mill Race Park como punto de partida del sendero.',
  'Open every day, 10 AM to midnight.':
    'Abierto todos los días, de 10 AM a medianoche.',
  'If you are 21 or older, you can carry a drink from a designated business in a clear, branded Social District cup and walk with it inside the district.':
    'Si tiene 21 años o más, puede llevar una bebida de un negocio designado en un vaso transparente del Distrito Social y caminar con ella dentro del distrito.',
  'Each business can send a person out with no more than two open drinks.':
    'Cada negocio puede dejar salir a una persona con no más de dos bebidas abiertas.',
  'Cup limits: beer up to 16 ounces; wine, cider or a premixed cocktail up to 12 ounces; a liquor drink up to 10 ounces with no more than 2 ounces of liquor.':
    'Límites por vaso: cerveza hasta 16 onzas; vino, sidra o cóctel preparado hasta 12 onzas; una bebida con licor hasta 10 onzas, con no más de 2 onzas de licor.',
  'Drinks bought outside the district can’t be carried in it, and any business can ask you not to bring a drink inside.':
    'No se pueden llevar dentro del distrito bebidas compradas fuera de él, y cualquier negocio puede pedirle que no entre con una bebida.',
  'The city lists 17 designated businesses.':
    'La ciudad tiene 17 negocios designados.',
};

export const esDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('es-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
