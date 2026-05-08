import jwt from "jsonwebtoken";

/**
 * Middleware: verify JWT token and attach user to request.
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

/**
 * Middleware: allow only admins.
 * Must be used after verifyToken.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Forbidden. Admins only." });
  next();
}
