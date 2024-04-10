import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function to handle image uploads
async function uploadImage(filePath) {
  if (!filePath) return null;
  const uploadedImage = await uploadOnCloudinary(filePath);
  return uploadedImage ? uploadedImage.url : null;
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, bio, homeTown, password } = req.body;

  // Validate input fields
  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists!");
  }

  // Safely access dp and coverPic paths
  const dpLocalPath = req.files?.dp?.[0]?.path ?? null;
  const coverPicLocalPath = req.files?.coverPic?.[0]?.path ?? null;

  if (!dpLocalPath) {
    throw new ApiError(400, "Dp is required!");
  }

  // Upload images only if paths are provided
  const dp = dpLocalPath ? await uploadOnCloudinary(dpLocalPath) : null;
  const coverPic = coverPicLocalPath
    ? await uploadOnCloudinary(coverPicLocalPath)
    : null;

  // Create user with or without coverPic
  const user = await User.create({
    fullName,
    dp: dp.url,
    coverPic: coverPic ? coverPic.url : "", // Use coverPic.url if available, else empty string
    email,
    username: username.toLowerCase(),
    password,
    bio: bio?.trim() || "",
    homeTown: homeTown?.trim() || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully!"));
});

export { registerUser };
