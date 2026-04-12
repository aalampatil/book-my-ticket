import { VerifyUserToken } from "./jwt-token.js";

export function authenticationMiddleware() {
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return next();

    try {
      const user = VerifyUserToken(token);
      console.log(user)
      req.user = user;
    } catch (err) {
      console.log("Invalid token");
    }

    next();
  };
}
export function restrictToAuthenticated() {
  return (req, res, next) => {
    // console.log(req.user)
    if (!req.user)
      return res.redirect("/register");

    return next()
  };
}