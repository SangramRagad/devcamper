const express = require("express");
const {
  getBoocamps,
  getBoocamp,
  createBoocamp,
  updateBootcamp,
  deleteBoocamp,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

//Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
//Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBoocamps)
  .post(protect, authorize("publisher", "admin"), createBoocamp);

router
  .route("/:id")
  .get(getBoocamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBoocamp);
router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
