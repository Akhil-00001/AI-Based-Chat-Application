const express = require("express");
const { rewrite } = require("../controllers/aiController");

const router = express.Router();

router.post("/rewrite", rewrite);

module.exports = router;