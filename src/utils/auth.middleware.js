import { verifyUserToken } from "./jwt-token.js";

/**
 * Soft authentication middleware.
 * Runs on every request. If a valid token exists in cookies,
 * attaches the decoded user payload to req.user.
 * Does NOT block unauthenticated requests — that's restrictToAuthenticated's job.
 */
export function authenticationMiddleware() {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
      const decoded = verifyUserToken(token);
      if (decoded) {
        req.user = decoded; // { email, iat, exp }
      }
    }
    next();
  };
}

/**
 * Guard middleware — blocks unauthenticated users.
 * For API routes (JSON): responds with 401.
 * For page routes (HTML): redirects to /login.
 * Heuristic: if the request expects JSON (XHR / fetch), send 401 JSON.
 */
export function restrictToAuthenticated() {
  return (req, res, next) => {
    if (req.user) return next();

    const wantsJSON =
      req.headers["accept"]?.includes("application/json") ||
      req.headers["content-type"]?.includes("application/json") ||
      req.xhr;

    if (wantsJSON) {
      return res.status(401).json({ error: "Unauthorised. Please log in." });
    }

    // For browser page navigations, redirect to login
    res.redirect("/login");
  };
}