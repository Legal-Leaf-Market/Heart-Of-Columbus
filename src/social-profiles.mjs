// Only profile URLs belong on a directory listing. Preserve Facebook's ID
// query for profile.php and discard tracking parameters from the others.
const FACEBOOK_NON_PROFILES = new Set([
  '2008', 'ads', 'business', 'dialog', 'events', 'groups', 'help', 'home.php',
  'l.php', 'login', 'login.php', 'marketplace', 'plugins', 'reel', 'reels',
  'share', 'sharer', 'sharer.php', 'tr', 'watch',
]);
const INSTAGRAM_NON_PROFILES = new Set([
  'about', 'accounts', 'api', 'developer', 'direct', 'explore', 'p', 'reel',
  'reels', 'stories', 'tv',
]);

export function socialProfile(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  const path = url.pathname.replace(/^\/|\/$/g, '');
  const parts = path.split('/');
  if (host === 'instagram.com' && parts.length === 1 && /^[\w.]{1,30}$/.test(path) && !INSTAGRAM_NON_PROFILES.has(path.toLowerCase())) {
    return { label: 'Instagram', url: `https://www.instagram.com/${path.toLowerCase()}/` };
  }
  if (host !== 'facebook.com') return null;
  const id = url.searchParams.get('id');
  if (path.toLowerCase() === 'profile.php' && /^\d+$/.test(id || '')) {
    return { label: 'Facebook', url: `https://www.facebook.com/profile.php?id=${id}` };
  }
  const page = parts[0].toLowerCase();
  const pageName = /^[\w.-]+$/.test(page) && !FACEBOOK_NON_PROFILES.has(page) && !page.endsWith('.php');
  const legacyPage = /^(?:pages|people|p)\/[\w%./-]+$/i.test(path) && parts.length >= 2 && /\d{5,}$/.test(path);
  if ((parts.length === 1 && pageName) || legacyPage) {
    return { label: 'Facebook', url: `https://www.facebook.com/${legacyPage ? path : page}/` };
  }
  return null;
}
