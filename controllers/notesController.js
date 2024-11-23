const Note = require("../models/Note");
const Joi = require("joi");

const validateNote = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().valid("Work", "Personal", "Others").default("Others"),
  });
  return schema.validate(data);
};

// Add a new note
exports.createNote = async (req, res) => {
  const { error } = validateNote(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notes
exports.getNotes = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};

  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: "i" };

  try {
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
