import jwt from "jsonwebtoken";
export function createUserToken(email) {
  const token = jwt.sign(email, process.env.JWT_SECRET);
  return token;
}
export function VerifyUserToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}