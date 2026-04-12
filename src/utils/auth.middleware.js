import { VerifyUserToken } from "./jwt-token.js";

export function authenticationMiddleware() {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return next();

    if (!header.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ error: "authorization header must start with Bearer" });
    }

    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "token missing" });
    }

    try {
      const user = VerifyUserToken(token);
      req.user = user;
    } catch (err) {
      return res.status(401).json({ error: "invalid token" });
    }

    next();
  };
}
export function restrictToAuthenticated() {
  return (req, res) => {
    if (!req.user)
      return res.redirect("/register");

    return next()
  };
}