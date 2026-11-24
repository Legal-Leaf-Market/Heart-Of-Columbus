// Owner rules for what Heart of Columbus may show from a business's own
// store. A rule comes only from the owner, with the reason and the date, and
// it can only hide products, never add them. It runs everywhere a catalog is
// read: /api/shop, the daily snapshot (scripts/snapshot-catalogs.mjs) and
// the checkout stock check (/api/stock), so a hidden product can't reach a
// cart from an old page either. tests/shop-rules.test.mjs.
//
// `hideShopify(p)` gets a product as Shopify's public JSON gives it
// (product_type, tags, vendor, title).

const NICOTINE_TYPE = /nicotine(?!\s*-?\s*free)|cigar|tobacco/i;

export const SHOP_RULES = {
  'legal-leaf-market-cafe': {
    by: 'Jacob Kennedy, owner', on: '2026-11-24',
    why: 'Legal Leaf Market is not licensed to sell nicotine products. Those are sold only through Nicotia Market, as an affiliate, so they never show here.',
    // Everything tagged for Nicotia Market, and any nicotine, cigar or
    // tobacco product type even if a tag is missing.
    hideShopify: (p) => (Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(/,\s*/)).some((t) => String(t).toLowerCase() === 'nicotia')
      || NICOTINE_TYPE.test(String(p.product_type || p.type || '')),
  },
};
