// The "Columbus" (2017) film trail (/film/). Only landmarks and public places
// that a cited source says appear in the film; private offices and businesses
// shown in it are left out. Each stop names its source and the day it was checked.
const CHECKED = '2026-10-26';
const WIKI = 'https://en.wikipedia.org/wiki/Columbus_(2017_film)';
const VISIT = 'https://columbus.in.us/columbus-the-movie/';

export const FILM = {
  title: 'Columbus', year: 2017, director: 'Kogonada',
  facts: [
    { text: 'Columbus is a 2017 drama written and directed by Kogonada, shot on location in Columbus over 18 days.', source: WIKI, checked: CHECKED },
    { text: 'The Visitors Center at 506 Fifth Street has a free guide to the places where scenes were shot.', source: VISIT, checked: CHECKED },
  ],
  guide: VISIT,
};

// [landmark slug, source, what the source says]
export const FILM_STOPS = [
  { landmark: 'firstchristian', source: WIKI, checked: CHECKED, line: 'Named among the modernist buildings that feature in the film.' },
  { landmark: 'irwin', source: WIKI, checked: CHECKED, line: 'Named among the modernist buildings that feature in the film.' },
  { landmark: 'northchristian', source: WIKI, checked: CHECKED, line: 'Named among the modernist buildings that feature in the film.' },
  { landmark: 'library', source: WIKI, checked: CHECKED, line: 'Named among the modernist buildings that feature in the film.' },
  { landmark: 'miller', source: WIKI, checked: CHECKED, line: 'Named among the modernist buildings that feature in the film. Seen only on the official tour.' },
  { landmark: 'courthouse', source: VISIT, checked: CHECKED, line: 'The visitors bureau shows a scene being prepared on Courthouse Square.' },
];
export const filmBySlug = Object.fromEntries(FILM_STOPS.map((s) => [s.landmark, s]));
