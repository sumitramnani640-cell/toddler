// src/helpers/guestCookie.js
const COOKIE_NAME = 'guest_cart_id';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

function genGuestId() {
  // stable, human-readable guest id (starts with 'g_')
  return `g_${Math.random().toString(36).slice(2,12)}_${Date.now()}`;
}

function ensureGuestId(req, res) {
  if (!req || !res) return null;

  // try existing cookie
  let id = req.cookies?.[COOKIE_NAME];

  if (!id) {
    id = genGuestId();

    // IMPORTANT: path:'/' and sameSite/lax ensures cookie is sent on POST/requests on same origin
    // secure:false for localhost (set true in production with HTTPS)
    res.cookie(COOKIE_NAME, id, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,   // safe: not readable by JS (you can switch to false if you need client-side reads)
      secure: false,    // set true when site served over HTTPS (production)
      sameSite: 'lax',  // allows cookie on normal POSTs/links while preventing some CSRF exposures
      path: '/'         // make sure cookie is sent for all app routes
    });

    // helpful for debugging
    // console.log('[guestCookie] set new guest id', id);
  }

  return id;
}

function getGuestId(req) {
  return req?.cookies?.[COOKIE_NAME] || null;
}

function clearGuestId(res) {
  if (!res) return;
  // clear cookie on root path as well
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

module.exports = { COOKIE_NAME, ensureGuestId, getGuestId, clearGuestId };
