import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @body { username, email, password }
 */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res
      .status(400)
      .json({ message: "username, email and password are required." });

  if (username.length < 3)
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters." });

  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ message: "Invalid email address." });

  try {
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res
        .status(409)
        .json({ message: "Email or username already in use." });

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

/**
 * @description Login with email + password
 * @route POST /api/auth/login
 * @body { email, password }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

/**
 * @description Get current authenticated user's profile
 * @route GET /api/auth/me
 * @access Private
 */
import { verifyToken } from "../middleware/auth.js";

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});


function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

export default router;
