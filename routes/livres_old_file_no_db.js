import { Router } from "express";
const router = Router();
import Joi from "joi";

const livres = [
  { id: 1, title: "Le Petit Prince", author: "Antoine de Saint-Exupéry" },
  { id: 2, title: "1984", author: "George Orwell" },
  { id: 3, title: "Moby Dick", author: "Herman Melville" },
];

function validationCreateLivre(title, author) {
  if (!title || !author) {
    return { isValid: false, message: "Title and author are required" };
  }

  if (title.length < 3 || author.length < 3) {
    return {
      isValid: false,
      message: "Title and author must be at least 3 characters long",
    };
  }

  return { isValid: true, message: "" };
}

/**
 * @description obtenir la liste des livres
 * @route /api/livres
 * @method GET
 * @access public
 */
router.get("/", (req, res) => {
  res.json(livres);
});

/**
 * @description obtenir un livre par son ID
 * @route /api/livres/:id
 * @method GET
 * @access public
 */

router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const livre = livres.find((l) => l.id === id);

  if (livre) {
    res.status(200).json(livre);
  } else {
    res.status(404).json({ message: "Livre not found" });
  }
});

// const schema = Joi.object({
//   title: Joi.string().min(3).required(),
//   author: Joi.string().min(3).required()
// })

/**
 * @description creer un livre
 * @route /api/livres
 * @method POST
 * @access public
 */

router.post("/", (req, res) => {
  // const { error, value } = schema.validate(req.body);
  const { isValid, message } = validationCreateLivre(
    req.body.title,
    req.body.author,
  );

  if (!isValid) {
    return res.status(400).json({ message });
  }

  const { title, author } = req.body;

  // if (!title || !author) {
  //   return res.status(400).json({ message: "Title and author are required" });
  // }

  // if (title.length < 3 || author.length < 3) {
  //   return res.status(400).json({ message: "Title and author must be at least 3 characters long" });
  // }

  const newLivre = {
    id: livres.length + 1,
    title,
    author,
  };

  livres.push(newLivre);

  res.status(201).json(newLivre);
});

function validateUpdateLivre(obj) {
  const { title, author } = obj;

  // nothing to update
  if (!title && !author) {
    return {
      isValid: false,
      message: "At least one field is required (title or author)",
    };
  }

  if (title !== undefined && title.length < 3) {
    return {
      isValid: false,
      message: "Title must be at least 3 characters long",
    };
  }

  if (author !== undefined && author.length < 3) {
    return {
      isValid: false,
      message: "Author must be at least 3 characters long",
    };
  }

  return { isValid: true, message: "" };
}

router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author } = req.body;
  const livre = livres.find((l) => l.id === id);

  if (!livre) {
    return res.status(404).json({ message: "Livre not found" });
  }

  const { isValid, message } = validationCreateLivre(title, author);
  if (!isValid) {
    return res.status(400).json({ message });
  }

  livre.title = title;
  livre.author = author;

  res.json(livre);
  res.status(200).json(livre);
});

router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = livres.findIndex((l) => l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Livre not found" });
  }

  livres.splice(index, 1);
  res.status(200).json({ message: "Livre deleted" });
});

export default router;
