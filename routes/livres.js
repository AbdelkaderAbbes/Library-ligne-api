import { Router } from "express";
const router = Router();
import Book, {
  validationCreateLivre,
  validateUpdateLivre,
} from "../models/Book.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

/**
 * @description obtenir la liste des livres
 * @route GET /api/livres
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    const livres = await Book.find().select("-_id -__v");
    res.json(livres);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @description obtenir un livre par son ID
 * @route GET /api/livres/:id
 * @access Public
 */
router.get("/:id", async (req, res) => {
  try {
    const livre = await Book.findOne({ id: parseInt(req.params.id) }).select(
      "-_id -__v",
    );
    if (!livre) return res.status(404).json({ message: "Livre not found" });
    res.json(livre);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @description créer un livre
 * @route POST /api/livres
 * @access Private (any logged-in user)
 */
router.post("/", verifyToken, async (req, res) => {
  const { title, author, description, prix } = req.body;

  const { isValid, message } = validationCreateLivre(title, author);
  if (!isValid) return res.status(400).json({ message });

  try {
    const newLivre = new Book({ title, author, description, prix });
    await newLivre.save();

    const { _id, __v, ...data } = newLivre.toObject();
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @description mettre à jour un livre
 * @route PUT /api/livres/:id
 * @access Private – Admin only
 */
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  const { title, author, description, prix } = req.body;

  const { isValid, message } = validateUpdateLivre({ title, author });
  if (!isValid) return res.status(400).json({ message });

  try {
    const livre = await Book.findOne({ id: parseInt(req.params.id) });
    if (!livre) return res.status(404).json({ message: "Livre not found" });

    const updated = await Book.findByIdAndUpdate(
      livre._id,
      { $set: { title, author, description, prix } },
      { new: true, select: "-_id -__v" },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @description supprimer un livre
 * @route DELETE /api/livres/:id
 * @access Private – Admin only
 */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const livre = await Book.findOne({ id: parseInt(req.params.id) });
    if (!livre) return res.status(404).json({ message: "Livre not found" });

    await Book.findByIdAndDelete(livre._id);

    res.json({ message: "Livre deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;