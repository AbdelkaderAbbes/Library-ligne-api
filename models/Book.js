import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    title: String,
    author: String,
    description: String,
    prix: Number,
  },
  {
    timestamps: true,
  },
);

bookSchema.pre("save", async function () {
  if (!this.isNew) return;

  const counter = await Counter.findByIdAndUpdate(
    "bookId",
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.id = counter.seq;
});


export function validationCreateLivre(title, author) {
  if (!title || !author)
    return { isValid: false, message: "Title and author are required" };
  if (title.length < 3 || author.length < 3)
    return {
      isValid: false,
      message: "Title and author must be at least 3 characters long",
    };
  return { isValid: true, message: "" };
}

export function validateUpdateLivre({ title, author }) {
  if (!title && !author)
    return {
      isValid: false,
      message: "At least one field is required (title or author)",
    };
  if (title !== undefined && title.length < 3)
    return {
      isValid: false,
      message: "Title must be at least 3 characters long",
    };
  if (author !== undefined && author.length < 3)
    return {
      isValid: false,
      message: "Author must be at least 3 characters long",
    };
  return { isValid: true, message: "" };
}


const Book = mongoose.model("Book", bookSchema);
export default Book;