const express = require("express");
const router = express.Router();
const { createEvent, getEvents } = require("../controller/event-controller");
const { uploadLocal, uploadCloud } = require("../middlewares/fileUpload");

router.post("/", uploadCloud("image"), createEvent);
router.get("/", getEvents);

module.exports = router;
