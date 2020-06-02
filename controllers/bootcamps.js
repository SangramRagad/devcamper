const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
//@desc      Show bootcamps
//@route     Get  /api/v1/bootcamps
//@access    public
exports.getBoocamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
//@desc      Show single bootcamp
//@route     Get  /api/v1/bootcamps/:id
//@access    public
exports.getBoocamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the Id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ status: true, data: bootcamp });
});
//res.status(400).json({ status: false, Error: err.message });

//@desc      Create a bootcamp
//@route     POST  /api/v1/bootcamps
//@access    Private
exports.createBoocamp = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  //check for published bootcamp
  const publishBootcamp = await Bootcamp.findOne({ user: req.user.id });
  if (publishBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The user with ID${req.user.id} has already publish a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    status: true,
    data: bootcamp,
  });
});

//@desc      Update bootcamp
//@route     PUT  /api/v1/bootcamps/:id
//@access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the Id of ${req.params.id}`,
        404
      )
    );
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not autorized to update this bootcamp`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: true, data: bootcamp });
});

//@desc      Delete bootcamp
//@route     DELETE  /api/v1/bootcamps/:id
//@access    Private
exports.deleteBoocamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the Id of ${req.params.id}`,
        404
      )
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not autorized to delete this bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();
  res.status(200).json({ status: true, data: {} });
});

//@desc      Upload photo for bootcamp
//@route     PUT  /api/v1/bootcamps/:id/photo
//@access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with the Id of ${req.params.id}`,
        404
      )
    );
  }
  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not autorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload file", 400));
  }
  const file = req.files.file;

  //Make sure the file is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload a image file", 400));
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload aN image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  //Create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  //Move file on location
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("Problem with file upload", 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  });
  res.status(200).json({
    success: true,
    data: file.name,
  });
});
