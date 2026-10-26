// The skate park page (/skate/): the Jolie Crider Memorial Skatepark 2.0 in
// Clifty Park. Every line names its source and the day it was checked. People
// appear only when a cited source names them in the park's story; nobody is
// listed as a Columbus skater who "made it" without a source that says so.
const CHECKED = '2026-10-26';
const PARK = 'https://columbusparksandrec.com/facilities-parks-and-trails/facility-listing/jolie-crider-memorial-skatepark-2-0/';
const CLIFTY = 'https://columbusparksandrec.com/faq-items/clifty-park/';
const VISIT = 'https://columbus.in.us/crider-skatepark/';
const REP_DESIGN = 'https://www.therepublic.com/2019/10/11/skate_of_the_art_skaterturnedarchitect_brings_talents_to_new_columbus_skate_park/';
const REP_LAYOUT = 'https://www.therepublic.com/?p=402691';
const REP_OPEN = 'https://www.therepublic.com/?p=403221';
const REP_FUNDS = 'https://www.therepublic.com/?p=391422';
const SLOWDOWN = 'https://www.slowdown.media/article/janne-saario-skateparks';

const f = (text, source) => ({ text, source, checked: CHECKED });

export const SKATE = {
  name: 'Jolie Crider Memorial Skatepark 2.0',
  address: 'Clifty Park, Indiana Avenue and Marr Road',
  official: PARK,
  directions: 'https://www.google.com/maps/search/?api=1&query=Jolie+Crider+Memorial+Skatepark+Columbus+Indiana',
  sections: [
    {
      id: 'the-park', emoji: '🛹', title: 'The park',
      facts: [
        f('The skate park is in Clifty Park at Indiana Avenue and Marr Road, across from Columbus East High School.', CLIFTY),
        f('It is open daily from 8 AM to dusk, and it is not supervised.', PARK),
        f('Skateboards, in-line skates, scooters and bikes only. No motorized vehicles, and no metal pegs on bikes or scooters.', PARK),
        f('Helmets, knee pads and elbow pads are highly recommended, and the concrete is very slippery when wet.', PARK),
        f('Food and drink stay out of the riding area, and spectators stay in the spectator area, off the structure.', PARK),
      ],
    },
    {
      id: 'whats-in-it', emoji: '🧱', title: 'What’s in it',
      facts: [
        f('The park has three sections that flow into each other. The entrance reuses about 2,500 square feet of the old wood slab, with new flat ground features and a bank up to a quarter pipe.', REP_LAYOUT),
        f('The middle is street and transition: a rainbow rail and quarter, a kong wall, jumps, bank to rails, hubbas and ledges across three levels.', REP_LAYOUT),
        f('The third section is a long, ditch style bowl with two minis of different heights, an extension, and a big transfer into a hip that leads back around.', REP_LAYOUT),
        f('At the edge are concrete stools, a stainless steel ping pong table, a spectator area and room for outdoor concerts and events.', PARK),
        f('Clifty Park around it has a playground, the Columbus Dog Park, about 1.25 miles of trails, three parking areas and a restroom that closes in winter.', CLIFTY),
      ],
    },
    {
      id: 'history', emoji: '📜', title: 'How it got here',
      facts: [
        f('The first park, mostly wood, was built in Clifty Park in 1999 after a group of local skaters pushed for one.', REP_OPEN),
        f('It is named for Jolie Crider, a Columbus North High School freshman who died of bacterial meningitis in 1998 at age 14.', REP_OPEN),
        f('After about 20 years the wood was worn out, and in 2018 the city chose to rebuild in concrete rather than repair it.', PARK),
        f('Columbus designer Jonathan Nesci, the parent of a skater, heard Finnish skater and architect Janne Saario on the 99 Percent Invisible podcast and wrote to him.', REP_DESIGN),
        f('Nesci traded Saario one of his mirror polished side tables for a concept design, and it became Saario’s first skate park in the United States.', REP_DESIGN),
        f('Nesci built the brief from three community input sessions.', SLOWDOWN),
        f('A $50,000 CreateINg Places grant, matched dollar for dollar by donors, was set up to close the fundraising gap.', REP_FUNDS),
        f('Hunger Skateparks of Bloomington built it. The project cost about $400,000, paid for by private donors, parks capital funds, the Heritage Fund of the Community Foundation of Bartholomew County and the Columbus Park Foundation.', REP_OPEN),
        f('The new concrete park was finished in 2019.', SLOWDOWN),
        f('About 100 people came to the ribbon cutting, where Jolie Crider’s mother, Shayla Holtkamp, was given a skateboard deck with her daughter’s name on it.', REP_OPEN),
        f('At the opening the parks director said groups from Indianapolis come to skate it every weekend.', REP_OPEN),
      ],
    },
    {
      id: 'skaters', emoji: '🙌', title: 'Columbus skaters',
      facts: [
        f('Columbus skater Steve Swartzentruber was photographed by The Republic skating the new park. His twin brother, Chris, worked for Hunger Skateparks, the crew that built it.', REP_DESIGN),
        f('A survey of more than 200 park users found that for two out of three, skating, BMX or scooters at the old park was their main exercise.', REP_DESIGN),
      ],
    },
  ],
  more: VISIT,
};

export const SKATE_FACTS = SKATE.sections.flatMap((s) => s.facts);
