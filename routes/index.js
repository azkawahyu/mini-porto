const express = require("express");
const router = express.Router();
const authRoute = require("./auth-route");
const eventRoute = require("./event-route");

router.use("/auth", authRoute);
router.use("/event", eventRoute);
module.exports = router;
