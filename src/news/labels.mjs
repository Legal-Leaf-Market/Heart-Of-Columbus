// Every story carries exactly one label, shown above its headline and
// explained on /about/standards/. The first eight come from the Trust
// Project's labels; History and Obituary are ours. Adding one means adding
// its definition here, nothing else.
export const LABELS = {
  News: 'Reporting on what happened, based on facts we checked ourselves or attributed to a named source.',
  Analysis: 'Reporting that explains why something happened or what it may mean, written by a reporter who knows the subject. It can draw conclusions but stays grounded in facts.',
  Opinion: 'An argument, written by a named author: editorials from the paper, columns, and letters from readers. Never mixed into news.',
  Explainer: 'Background that helps you understand an issue, a process or a place. No new news, just context.',
  Data: 'A story or tool built from public records or numbers, with a link to the data and a note on how we used it.',
  Community: 'Written by a community member or organization, edited by us for length and clarity. The writer is named.',
  'Meeting notes': 'Notes from a public meeting: who was there, what was decided, how people voted, and what to ask next. Taken by a named person and checked by an editor.',
  History: 'A look back at Columbus, sourced to archives, books and records, each named at the end.',
  Obituary: 'Written and submitted by the family or funeral home, and published as submitted after we confirm it came from them.',
  Sponsored: 'Paid for by the sponsor named on it. Our newsroom did not write it, and sponsors have no say in our coverage.',
};

// CSS hook for the badge color: .np-label-news, .np-label-opinion...
export const labelClass = (l) => 'np-label np-label-' + String(l).toLowerCase().replace(/\s+/g, '-');
