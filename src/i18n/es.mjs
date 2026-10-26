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
  links: { visit: 'Planee su visita', free: 'Gratis en Columbus', film: 'La ruta de la película Columbus', skate: 'El skatepark', holidays: 'Compras locales en las fiestas', credits: 'Créditos de fotos', claim: 'Reclame su listado', pickup: 'Pedidos para recoger', direct: 'Pedir, reservar y comprar directo' },
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
  jump: { 'visitors-center': 'Centro de Visitantes', tours: 'Tours de arquitectura', 'getting-here': 'Cómo llegar', 'getting-around': 'Cómo moverse', 'social-district': 'Distrito Social', 'call-ahead': 'Llame antes', 'your-way': 'Ideas de viaje', '/es/free/': 'Gratis en Columbus', '/es/film/': 'Ruta de cine', '/es/skate/': 'Skatepark', '/es/holidays/': 'Compras en las fiestas' },
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
  english: 'Los listados de negocios y los eventos siguen en inglés por ahora.',
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

// /free/, landmark and trip pages: page strings, then each sourced line keyed
// by its English text (FACTS above holds /visit/'s).
export const PAGES = {
  free: {
    title: 'Gratis en Columbus | Heart of Columbus',
    description: 'Cosas gratis en Columbus, Indiana: un área de juegos techada, la biblioteca de I. M. Pei, Mill Race Park, el People Trail, el autobús gratis y la arquitectura desde la calle, cada una con su fuente.',
    kicker: 'Gratis en Columbus', h1a: 'Columbus', h1b: 'sin gastar nada.',
    lede: (n) => `Un área de juegos a cubierto de la lluvia, una biblioteca de I. M. Pei, un parque junto al río, un autobús gratis y ${n} lugares emblemáticos que puede ver desde la acera.`,
    note: 'Cada punto enlaza a la página que dice que es gratis. Las cosas cambian, así que confirme antes de ir.',
    street: 'Desde la calle', streetTitle: 'Arquitectura desde la calle',
    streetLead: 'No necesita boleto para mirar. Estos están en calles públicas; los tours oficiales del Centro de Visitantes entran en algunos.',
    map: 'Véalos en el mapa', morning: 'Una mañana de arquitectura', building: 'Sobre el edificio', listing: 'Su listado aquí',
    foot: '¿Busca comida barata? No ordenamos los lugares por precio, porque los listados públicos que usamos no lo incluyen. Heart of Columbus no es la oficina de turismo y no tiene afiliación con estos lugares.',
    groups: { inside: 'Bajo techo', outside: 'Al aire libre', 'getting-around': 'Cómo moverse' },
    names: { 'commons-playground': 'Área de juegos techada en The Commons', 'visitors-center': 'Centro de Visitantes de Columbus', zinn: 'Arte callejero de David Zinn', 'bike-maps': 'Mapas para recorrer en bicicleta' },
  },
  landmark: {
    kicker: 'Lugar emblemático', crumb: 'Arquitectura', photo: 'Foto', source: 'Fuente',
    designed: 'Diseño', year: 'Año', where: 'Dónde', seeing: 'Cómo verlo',
    street: 'Se puede ver desde la calle, gratis.', tour: 'Solo en el tour oficial.', indoors: 'Bajo techo; confirme antes de ir.',
    officialTour: 'Tour oficial', tours: 'Tours de arquitectura', save: 'Guardar',
    facts: (src, ll, d) => `Datos de ${src}${ll ? `; punto en el mapa de ${ll}` : ''}. Revisado el ${d}. Heart of Columbus no es la oficina de turismo.`,
    measured: (label) => `Medido desde ${label}. `,
    walkNote: (m) => `Los tiempos a pie son estimaciones en línea recta, a unos ${m} metros por minuto. Las calles suman un poco.`,
    walk: (n) => `Unos ${n} min a pie (estimación)`, km: (n) => `A unos ${n} km`,
    coffee: 'Café a 5 minutos a pie', food: 'Restaurantes a 10 minutos a pie', shops: 'Tiendas a 10 minutos a pie', nearest: 'Independientes más cercanos',
    kCoffee: 'Muy cerca', kFood: 'Para comer cerca', kShops: 'De camino', kNearest: 'A poca distancia en auto',
    more: 'Más lugares emblemáticos', mapTitle: (n) => `Mapa de ${n}`,
    description: (n, a, y) => `${n} (${a}, ${y}) en Columbus, Indiana, y los negocios independientes a pocos pasos.`,
    walkFrom: { 'the Visitors Center, where the tour starts': 'el Centro de Visitantes, donde empieza el tour' },
  },
  trip: {
    kicker: (day) => `Un ${day} en Columbus`, crumb: 'Ideas de viaje', openList: 'Abrir como lista y mapa', saveAll: 'Guardar todas las paradas',
    landmark: 'Lugar emblemático', to: 'a',
    open: (a, b, day) => `Abierto de ${a} a ${b} los ${day.endsWith('o') ? day + 's' : day}`, orders: 'Pedidos para recoger en línea', original: 'Original de Columbus',
    dora: 'Distrito Social: bebidas para llevar', street: 'Se ve desde la calle, gratis', walk: (n, from) => `Unos ${n} min a pie desde ${from} (estimación)`,
    foot: 'Hecho con los listados de este sitio: horarios del listado de Google de cada negocio (octubre de 2026), datos de los lugares emblemáticos de sus fuentes citadas. Los tiempos a pie son estimaciones en línea recta. Los horarios cambian; llame antes. No tenemos afiliación con estos negocios.',
    more: 'Más formas de pasar el día', yourWay: 'Columbus a su manera', ideas: 'Ideas de viaje', stops: 'paradas',
    description: (t, day) => `${t}: un ${day} en Columbus, Indiana, hecho con horarios y direcciones reales.`,
    titles: {
      'architecture-morning': ['Mañana de arquitectura y almuerzo en el centro', 'Café, cuatro lugares emblemáticos que se ven desde la calle y luego el almuerzo. Cada parada queda a poca distancia a pie de la anterior.'],
      'shop-small-saturday': ['Compras locales un sábado', 'Panadería, libros y regalos en el centro, con almuerzo y helado entre medio. Cada parada queda a poca distancia a pie de la anterior.'],
      'date-night': ['Una cita en el centro', 'Cena, un postre de fuente de sodas y luego una bebida en el Distrito Social. Cada parada queda a poca distancia a pie de la anterior.'],
    },
  },
  days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  seeAll: 'Ver todo',
};

PAGES.film = {
  title: 'La ruta de la película Columbus | Heart of Columbus',
  description: 'Los lugares emblemáticos de Columbus, Indiana, que aparecen en la película Columbus (2017), cada uno con su fuente.',
  kicker: 'Ruta de cine', h1a: 'La ruta de', h1b: 'Columbus (2017)',
  lede: 'Los edificios de la película que puede ver usted mismo, solo lugares emblemáticos y públicos, cada uno con la fuente que lo confirma.',
  note: 'Solo incluimos lugares que una fuente citada confirma. Dejamos fuera oficinas privadas y negocios.',
  stops: 'Paradas', guide: 'Guía gratis en el Centro de Visitantes', map: 'Véalos en el mapa', building: 'Sobre el edificio',
  seen: 'Aparece en la película Columbus (2017)',
};

PAGES.holidays = {
  title: 'Compras locales en las fiestas | Heart of Columbus',
  description: (d) => `Small Business Saturday en Columbus, Indiana, es el ${d}. Tiendas independientes, tarjetas de regalo compradas directo y tiendas locales que venden en línea.`,
  kicker: 'Compras locales en las fiestas', h1a: 'Regale algo local', h1b: 'este año.',
  lede: (d) => `Small Business Saturday es el <strong>sábado ${d}</strong>. Aquí están los negocios independientes de Columbus para visitar ese día y toda la temporada, incluidos los que venden en línea desde su propio sitio.`,
  english: 'en inglés', take: 'Enlazamos a las páginas de cada negocio y no cobramos nada.',
  gifts: ['Regale local', 'Tarjetas de regalo, compradas a ellos'], giftOn: (label) => `Tarjetas de regalo en ${label}`,
  giftNote: 'Cada enlace va a la página de tarjetas de regalo del propio negocio o de su proveedor. El dinero es para ellos; nosotros no cobramos nada.',
  online: ['Desde su casa', 'Compre en línea y pague en su sitio'], feed: 'Catálogo en vivo aquí, pago en su sitio', store: 'Su propia tienda en línea',
  downtown: ['Por Washington Street', 'Regalos en el centro'], sweets: ['Café y dulces en el centro', 'Algo dulce en el camino'],
  saturday: ['Un plan para el sábado', 'Compras locales un sábado'], tripDay: 'Sábado · paradas en el centro',
  call: 'El horario de las fiestas puede cambiar, así que llame antes.',
  foot: 'Los datos de los negocios vienen de listados públicos y pueden cambiar en las fiestas. No tenemos afiliación con estos negocios y nunca cobramos ni tomamos pedidos por ellos.',
};

Object.assign(FACTS, {
  // /holidays/
  'Small Business Saturday is the Saturday after Thanksgiving, started by American Express in 2010 to encourage holiday shopping at small businesses.': 'Small Business Saturday es el sábado después del Día de Acción de Gracias. American Express lo creó en 2010 para animar las compras de las fiestas en negocios pequeños.',
  // /free/
  'The James A. Henderson Playground. The visitors bureau says it is free and open to the public.': 'El James A. Henderson Playground. La oficina de turismo dice que es gratis y abierto al público.',
  'The Commons is open every day, 8 AM to 9 PM, and its playground has a 35-foot Luckey Climber.': 'The Commons abre todos los días, de 8 AM a 9 PM, y su área de juegos tiene un Luckey Climber de 35 pies.',
  'The public library, designed by I. M. Pei and completed in 1969. It also holds the Columbus Indiana Architectural Archives.': 'La biblioteca pública, diseñada por I. M. Pei y terminada en 1969. También guarda los Columbus Indiana Architectural Archives.',
  'Hours change, so check the library’s page before you go.': 'Los horarios cambian, así que revise la página de la biblioteca antes de ir.',
  'Free videos about Columbus, shown any time, and a Dale Chihuly yellow neon chandelier. Maps, brochures and city guides are free to take.': 'Videos gratis sobre Columbus, a cualquier hora, y un candelabro de neón amarillo de Dale Chihuly. Los mapas, folletos y guías de la ciudad son gratis.',
  'Free parking in the lot just past the building on Franklin Street.': 'Estacionamiento gratis en el lote justo después del edificio, en Franklin Street.',
  'Over 23 miles of trail, according to the parks department.': 'Más de 23 millas de sendero, según el departamento de parques.',
  'Any people-powered way of getting around is welcome.': 'Se permite cualquier forma de moverse con fuerza humana.',
  'Trailheads have a kiosk with a map and the trail rules.': 'Los puntos de acceso tienen un quiosco con un mapa y las reglas del sendero.',
  'A city park with the Mill Race Tower, the Custer-Nugent Amphitheater, a playground and fishing areas.': 'Un parque de la ciudad con la Mill Race Tower, el Custer-Nugent Amphitheater, un área de juegos y zonas de pesca.',
  'It sits where the Flat Rock and Driftwood rivers meet. Redesigned by Michael Van Valkenburgh Associates and completed in 1993; the observation tower is 84 feet tall.': 'Está donde se juntan los ríos Flat Rock y Driftwood. Rediseñado por Michael Van Valkenburgh Associates y terminado en 1993; la torre de observación mide 84 pies.',
  'The city lists shelter rentals but no admission fee. Restrooms close in winter.': 'La ciudad publica precios para rentar refugios, pero ninguna tarifa de entrada. Los baños cierran en invierno.',
  'Street art by David Zinn around town. Pick up a free search-and-find guide to the locations at the Visitors Center.': 'Arte callejero de David Zinn por la ciudad. Pida en el Centro de Visitantes una guía gratis para encontrar los lugares.',
  'Free maps for seeing the architecture by bike, from the Visitors Center.': 'Mapas gratis del Centro de Visitantes para ver la arquitectura en bicicleta.',
  'The city bus is free to ride. Five routes run Monday to Saturday; no Sunday service is listed.': 'El autobús de la ciudad es gratis. Cinco rutas funcionan de lunes a sábado; no aparece servicio los domingos.',
  'Routes and times.': 'Rutas y horarios.',
  // /film/
  'Columbus is a 2017 drama written and directed by Kogonada, shot on location in Columbus over 18 days.': 'Columbus es un drama de 2017 escrito y dirigido por Kogonada, filmado en Columbus durante 18 días.',
  'The Visitors Center at 506 Fifth Street has a free guide to the places where scenes were shot.': 'El Centro de Visitantes, en 506 Fifth Street, tiene una guía gratis de los lugares donde se filmaron las escenas.',
  'Named among the modernist buildings that feature in the film.': 'Nombrado entre los edificios modernistas que aparecen en la película.',
  'Named among the modernist buildings that feature in the film. Seen only on the official tour.': 'Nombrado entre los edificios modernistas que aparecen en la película. Solo se ve en el tour oficial.',
  'The visitors bureau shows a scene being prepared on Courthouse Square.': 'La oficina de turismo muestra la preparación de una escena en Courthouse Square.',
  // landmarks: what
  'A church dedicated in 1942, with later details by Eero Saarinen and Charles Eames. A National Historic Landmark since 2001.': 'Una iglesia dedicada en 1942, con detalles posteriores de Eero Saarinen y Charles Eames. National Historic Landmark desde 2001.',
  'A church completed in 1964, with Kevin Roche as associate architect. A National Historic Landmark since 2000.': 'Una iglesia terminada en 1964, con Kevin Roche como arquitecto asociado. National Historic Landmark desde 2000.',
  'A bank hall that opened in 1955, with a 1973 annex by Kevin Roche and John Dinkeloo and landscape by Dan Kiley. A National Historic Landmark since 2000.': 'Una sala bancaria abierta en 1955, con un anexo de 1973 de Kevin Roche y John Dinkeloo y paisajismo de Dan Kiley. National Historic Landmark desde 2000.',
  'The public library, completed in 1969, and Henry Moore’s Large Arch, installed in 1971.': 'La biblioteca pública, terminada en 1969, y el Large Arch de Henry Moore, instalado en 1971.',
  'The county courthouse, built from 1871 to 1874. Part of the Columbus Historic District on the National Register.': 'El tribunal del condado, construido de 1871 a 1874. Parte del Columbus Historic District en el Registro Nacional.',
  'The city’s offices, built in 1981.': 'Las oficinas de la ciudad, construidas en 1981.',
  'The Second Street bridge, completed in 1999 and renamed for Robert N. Stewart in 2013.': 'El puente de Second Street, terminado en 1999 y renombrado en honor a Robert N. Stewart en 2013.',
  'A house by Eero Saarinen with Kevin Roche, and a garden by Dan Kiley, finished in 1957. There is no public access at the house; it is seen on the official tour, which starts at the Visitors Center.': 'Una casa de Eero Saarinen con Kevin Roche y un jardín de Dan Kiley, terminados en 1957. No hay acceso público a la casa; se ve en el tour oficial, que empieza en el Centro de Visitantes.',
  'A fire station, started in 1967 and completed in 1968.': 'Una estación de bomberos, empezada en 1967 y terminada en 1968.',
  'A seven-ton moving sculpture by the Swiss artist Jean Tinguely, inside The Commons.': 'Una escultura en movimiento de siete toneladas del artista suizo Jean Tinguely, dentro de The Commons.',
  // landmarks: notes
  'I. M. Pei, 1969; Henry Moore, 1971': 'I. M. Pei, 1969; Henry Moore, 1971',
  'Edward Charles Bassett, SOM, 1981': 'Edward Charles Bassett, SOM, 1981',
  'Second Street over the river, 1999': 'Second Street sobre el río, 1999',
  'Robert Venturi and Denise Scott Brown, 1968': 'Robert Venturi y Denise Scott Brown, 1968',
});

export const esDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('es-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

PAGES.skate = {
  title: 'El skatepark de Columbus | Heart of Columbus',
  description: 'El Jolie Crider Memorial Skatepark 2.0 en Clifty Park, Columbus, Indiana: horario, reglas, qué tiene y cómo se construyó, cada dato con su fuente.',
  kicker: 'Skatepark', h1a: 'Jolie Crider', h1b: 'Memorial Skatepark 2.0',
  lede: 'Columbus tiene un skatepark de concreto en Clifty Park, diseñado por un skater finlandés que se hizo arquitecto y construido por un equipo de skaters de Bloomington. Aquí está dónde queda, qué tiene y cómo llegó a existir.',
  note: 'Heart of Columbus no es el departamento de parques. Cada dato enlaza a donde lo encontramos. Las reglas y el horario vienen de la página de la ciudad; revísela antes de ir.',
  titles: { 'the-park': 'El parque', 'whats-in-it': 'Qué tiene', history: 'Cómo llegó aquí', skaters: 'Skaters de Columbus' },
  kickers: { 'the-park': 'Antes de ir', 'whats-in-it': 'El diseño', history: 'De 1999 a hoy', skaters: 'La gente' },
  skatersNote: 'Todavía no hemos encontrado una fuente pública que nombre a un skater de Columbus que se haya hecho profesional o haya hecho carrera en el skate. Solo agregamos personas cuando una fuente lo dice, para no adivinar la historia de nadie.',
  official: 'La página de la ciudad', directions: 'Cómo llegar', more: 'Visit Columbus Indiana sobre el parque',
};

Object.assign(FACTS, {
  // /skate/
  'The skate park is in Clifty Park at Indiana Avenue and Marr Road, across from Columbus East High School.': 'El skatepark está en Clifty Park, en Indiana Avenue y Marr Road, frente a Columbus East High School.',
  'It is open daily from 8 AM to dusk, and it is not supervised.': 'Abre todos los días de 8 AM al anochecer y no tiene supervisión.',
  'Skateboards, in-line skates, scooters and bikes only. No motorized vehicles, and no metal pegs on bikes or scooters.': 'Solo patinetas, patines en línea, scooters y bicicletas. No se permiten vehículos motorizados ni pegs de metal en bicicletas o scooters.',
  'Helmets, knee pads and elbow pads are highly recommended, and the concrete is very slippery when wet.': 'Se recomienda mucho usar casco, rodilleras y coderas, y el concreto es muy resbaloso cuando está mojado.',
  'Food and drink stay out of the riding area, and spectators stay in the spectator area, off the structure.': 'No se permite comida ni bebida en el área de patinaje, y los espectadores se quedan en su área, fuera de la estructura.',
  'The park has three sections that flow into each other. The entrance reuses about 2,500 square feet of the old wood slab, with new flat ground features and a bank up to a quarter pipe.': 'El parque tiene tres secciones que fluyen entre sí. La entrada reutiliza unos 2,500 pies cuadrados de la losa de madera anterior, con nuevos elementos de piso plano y un bank hacia un quarter pipe.',
  'The middle is street and transition: a rainbow rail and quarter, a kong wall, jumps, bank to rails, hubbas and ledges across three levels.': 'El centro es de street y transición: un rainbow rail con quarter, un kong wall, saltos, bank to rails, hubbas y ledges en tres niveles.',
  'The third section is a long, ditch style bowl with two minis of different heights, an extension, and a big transfer into a hip that leads back around.': 'La tercera sección es un bowl largo tipo zanja con dos minis de distinta altura, una extensión y un gran transfer hacia un hip que regresa al resto del parque.',
  'At the edge are concrete stools, a stainless steel ping pong table, a spectator area and room for outdoor concerts and events.': 'En el borde hay bancos de concreto, una mesa de ping pong de acero inoxidable, un área para espectadores y espacio para conciertos y eventos al aire libre.',
  'Clifty Park around it has a playground, the Columbus Dog Park, about 1.25 miles of trails, three parking areas and a restroom that closes in winter.': 'Alrededor, Clifty Park tiene un área de juegos, el Columbus Dog Park, unas 1.25 millas de senderos, tres estacionamientos y un baño que cierra en invierno.',
  'The first park, mostly wood, was built in Clifty Park in 1999 after a group of local skaters pushed for one.': 'El primer parque, casi todo de madera, se construyó en Clifty Park en 1999 después de que un grupo de skaters locales lo pidiera.',
  'It is named for Jolie Crider, a Columbus North High School freshman who died of bacterial meningitis in 1998 at age 14.': 'Lleva el nombre de Jolie Crider, estudiante de primer año de Columbus North High School que murió de meningitis bacteriana en 1998, a los 14 años.',
  'After about 20 years the wood was worn out, and in 2018 the city chose to rebuild in concrete rather than repair it.': 'Después de unos 20 años la madera estaba gastada, y en 2018 la ciudad decidió reconstruirlo en concreto en vez de repararlo.',
  'Columbus designer Jonathan Nesci, the parent of a skater, heard Finnish skater and architect Janne Saario on the 99 Percent Invisible podcast and wrote to him.': 'El diseñador de Columbus Jonathan Nesci, padre de un skater, escuchó al skater y arquitecto finlandés Janne Saario en el podcast 99 Percent Invisible y le escribió.',
  'Nesci traded Saario one of his mirror polished side tables for a concept design, and it became Saario’s first skate park in the United States.': 'Nesci le dio a Saario una de sus mesas auxiliares pulidas como espejo a cambio de un diseño conceptual, y se convirtió en el primer skatepark de Saario en Estados Unidos.',
  'Nesci built the brief from three community input sessions.': 'Nesci armó el programa a partir de tres sesiones de opinión con la comunidad.',
  'A $50,000 CreateINg Places grant, matched dollar for dollar by donors, was set up to close the fundraising gap.': 'Una subvención de $50,000 de CreateINg Places, igualada dólar por dólar por donantes, se usó para cerrar la brecha de recaudación.',
  'Hunger Skateparks of Bloomington built it. The project cost about $400,000, paid for by private donors, parks capital funds, the Heritage Fund of the Community Foundation of Bartholomew County and the Columbus Park Foundation.': 'Lo construyó Hunger Skateparks, de Bloomington. El proyecto costó unos $400,000, pagados por donantes privados, fondos de capital de parques, el Heritage Fund de la Community Foundation of Bartholomew County y la Columbus Park Foundation.',
  'The new concrete park was finished in 2019.': 'El nuevo parque de concreto se terminó en 2019.',
  'About 100 people came to the ribbon cutting, where Jolie Crider’s mother, Shayla Holtkamp, was given a skateboard deck with her daughter’s name on it.': 'Unas 100 personas fueron a la inauguración, donde la madre de Jolie Crider, Shayla Holtkamp, recibió una tabla de skate con el nombre de su hija.',
  'At the opening the parks director said groups from Indianapolis come to skate it every weekend.': 'En la inauguración, el director de parques dijo que cada fin de semana vienen grupos de Indianapolis a patinarlo.',
  'Columbus skater Steve Swartzentruber was photographed by The Republic skating the new park. His twin brother, Chris, worked for Hunger Skateparks, the crew that built it.': 'The Republic fotografió al skater de Columbus Steve Swartzentruber patinando el nuevo parque. Su hermano gemelo, Chris, trabajaba para Hunger Skateparks, el equipo que lo construyó.',
  'A survey of more than 200 park users found that for two out of three, skating, BMX or scooters at the old park was their main exercise.': 'Una encuesta a más de 200 usuarios encontró que, para dos de cada tres, patinar, andar en BMX o en scooter en el parque anterior era su principal ejercicio.',
});
