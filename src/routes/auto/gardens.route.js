import express from "express";
const router = express.Router();

const gardens = [
  { id: 1, name: "Backyard", type: "outdoor", city: "Paris" },
  { id: 2, name: "Living room", type: "indoor", city: "Paris" },
];

router.get("/", (req, res) => res.status(200).json(gardens));

router.post("/", (req, res) => {
  const { name, type, city } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Missing required fields: name, type" });
  }
  if (type !== "indoor" && type !== "outdoor") {
    return res.status(400).json({ error: "type must be 'indoor' or 'outdoor'" });
  }
  const newGarden = { id: gardens.length + 1, name, type, city: city || null };
  gardens.push(newGarden);
  res.status(201).json(newGarden);
});

export default router;