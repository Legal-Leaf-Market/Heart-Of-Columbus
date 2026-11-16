/* Framework-neutral integration reference, not a drop-in patch. */
export type BusinessMedia =
  | { state: 'none'; reason: 'missing' | 'unapproved' | 'failed' }
  | { state: 'photo' | 'logo'; businessId: string; locationId: string;
      src: string; alt: string; credit: string; sourceUrl: string;
      permissionBasis: string; reviewedAt: string; approved: true };
export function resolveBusinessMedia(
  businessId: string,
  locationId: string,
  candidate?: Exclude<BusinessMedia, { state: 'none' }>
): BusinessMedia {
  if (!candidate) return {state: 'none', reason: 'missing'};
  if (candidate.approved !== true || candidate.businessId !== businessId ||
      candidate.locationId !== locationId || !candidate.permissionBasis ||
      !candidate.reviewedAt || !candidate.src || !candidate.sourceUrl ||
      /art-(cover|sticker)-|\/art\/(sticker|cover)/i.test(candidate.src)) {
    return {state: 'none', reason: 'unapproved'};
  }
  return candidate;
}
/* Render none => no media region. Logo => small contained identity mark.
   Photo => responsive real photo, separate caption/credit, useful alt.
   onerror => update this record's state to {state:'none', reason:'failed'}.
   Never render category art as an error fallback. Reuse on every surface.
   This metadata gate does not visually verify a photo or grant permission. */
