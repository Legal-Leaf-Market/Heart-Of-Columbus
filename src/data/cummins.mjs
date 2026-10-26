// The Cummins page (/cummins/). Cummins is not a listed business here and is
// not affiliated with this site. Every line has its source and the day it was
// checked; figures say which year they are for.

const CHECKED = '2026-10-26';
const WP = 'https://en.wikipedia.org/wiki/';
const CO = 'https://www.cummins.com/news/cummins-global-power-leader';
const VB = 'https://columbus.in.us/cummins-history/';
const x = (text, source) => ({ text, source, checked: CHECKED });

export const CUMMINS = {
  name: 'Cummins Inc.', ticker: 'CMI', exchange: 'NYSE', site: 'https://www.cummins.com/',
  hq: { name: 'Cummins Corporate Office Building', address: '500 Jackson Street', ll: [39.20612, -85.92405] },
  intro: [
    x('Cummins was founded in Columbus on February 3, 1919, by the mechanic Clessie Cummins and the banker William G. Irwin. It is still headquartered downtown.', WP + 'Cummins'),
    x('It makes diesel engines, power generation equipment and filtration, and through Accelera, zero-emissions power such as fuel cells, batteries and electrolyzers.', WP + 'Cummins'),
    x('Cummins is by far the region’s largest employer.', WP + 'Columbus,_Indiana'),
  ],
  numbers: [
    ['69,600', 'employees worldwide in 2024'],
    ['$34.1 billion', 'revenue in 2024'],
    ['1919', 'founded in Columbus'],
    ['NYSE: CMI', 'in the S&P 500'],
  ].map(([value, label]) => ({ value, label, source: WP + 'Cummins', checked: CHECKED })),
  timeline: [
    { year: 1908, ...x('W. G. Irwin hires Clessie Cummins as his driver and to look after his cars.', CO) },
    { year: 1919, ...x('Cummins Engine Company is founded on February 3, with Irwin putting up the starting capital.', CO) },
    { year: 1924, ...x('The Model F becomes the company’s first distinctive engine line.', CO) },
    { year: 1931, ...x('Clessie Cummins enters the Indianapolis 500 with a diesel engine he built, in a Duesenberg.', WP + 'Clessie_Cummins') },
    { year: 1934, ...x('J. Irwin Miller becomes general manager.', VB) },
    { year: 1937, ...x('Cummins records its first profit.', CO) },
    { year: 1941, ...x('It offers the transport industry’s first 100,000-mile warranty.', CO) },
    { year: 1952, ...x('Fred Agabashian puts the Cummins Diesel Special on the pole at the Indianapolis 500. It drops out after 71 laps.', WP + 'Fred_Agabashian') },
    { year: 1952, ...x('From 1952 to 1959, more than half the heavy-duty truck market runs on Cummins engines.', WP + 'Cummins') },
    { year: 1954, ...x('Miller sets up the Cummins Foundation.', VB) },
    { year: 1956, ...x('The first factory outside the United States opens in Shotts, Scotland.', CO) },
    { year: 1957, ...x('The foundation offers to pay the architects’ fees for new public buildings in Columbus.', VB) },
    { year: 1960, ...x('The compression release engine brake Clessie Cummins designed goes on sale as the Jake Brake, from Jacobs Vehicle Systems.', WP + 'Clessie_Cummins') },
    { year: 1983, ...x('The Corporate Office Building by Kevin Roche opens downtown, built around the Cerealine Building, Cummins’ first factory and office.', WP + 'Cummins_Corporate_Office_Building') },
    { year: 2022, ...x('Cummins buys Jacobs Vehicle Systems, the maker of the Jake Brake.', WP + 'Cummins') },
    { year: 2023, ...x('Its New Power business is renamed Accelera by Cummins.', WP + 'Cummins') },
    { year: 2023, ...x('In December, the U.S. Justice Department fines Cummins $1.675 billion over Clean Air Act violations.', WP + 'Cummins') },
  ],
  people: [
    x('Clessie Cummins received 33 U.S. patents and set five world records for endurance and speed with trucks, buses and race cars.', WP + 'Clessie_Cummins'),
    x('J. Irwin Miller led Cummins as president from 1947 to 1951 and chairman from 1951 to 1977.', WP + 'J._Irwin_Miller'),
    x('Jennifer Rumsey is president and CEO; N. Thomas Linebarger is executive chairman.', WP + 'Cummins'),
  ],
  downtown: [
    x('The Corporate Office Building at 500 Jackson Street sits on a former rail yard three blocks long. Its landscaped east lawn is open to the public as a park.', WP + 'Cummins_Corporate_Office_Building'),
    x('Rudolph de Harak’s sculpture Exploded Engine is in the lobby.', WP + 'Cummins_Corporate_Office_Building'),
  ],
};
