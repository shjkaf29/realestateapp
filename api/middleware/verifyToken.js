import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  console.log(`[verifyToken] Middleware called for ${req.method} ${req.originalUrl}`);
  console.log(`[verifyToken] Headers:`, req.headers);
  console.log(`[verifyToken] Cookies:`, req.cookies);
  
  const token = req.cookies.token;
  console.log(`[verifyToken] Token found:`, token ? "YES" : "NO");

  if (!token) {
    console.log(`[verifyToken] No token found, returning 401`);
    return res.status(401).json({ message: "Not Authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      console.log(`[verifyToken] Token verification failed:`, err.message);
      return res.status(403).json({ message: "Token is not Valid!" });
    }
    
    console.log(`[verifyToken] Token verified successfully, userId:`, payload.id);
    req.userId = payload.id;
    console.log(`[verifyToken] Calling next() to continue to controller`);
    next();
  });
};
