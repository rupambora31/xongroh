import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refreshToken in DB for future reference
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// cookies can only be modified through server because of "options".
const options = {
  httpOnly: true,
  secure: true,
};

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

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  // console.log(email);

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // sending this optional data for mobile app (case),
          // where cookies are not available
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true, // for new updated value
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, bio, homeTown } = req.body;

  if (!fullName || !email || !bio || !homeTown) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        bio,
        homeTown,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// function to extract the public ID from a Cloudinary URL
// https://res.cloudinary.com/<cloud-name>/image/upload/<public-id>.<format>
function extractPublicIdFromUrl(url) {
  const parts = url.split("/");
  const publicIdWithFormat = parts[parts.length - 1];
  const publicId = publicIdWithFormat.split(".")[0];
  return publicId;
}

const updateUserDp = asyncHandler(async (req, res) => {
  const dpLocalPath = req.file?.path;

  if (!dpLocalPath) {
    throw new ApiError(400, "DP file is missing");
  }

  // Retrieve the old picture URL
  const user = await User.findById(req.user?._id).select("coverPic");
  const oldCoverPicUrl = user.coverPic;

  // Extract the public ID from the old picture URL
  const oldPublicId = extractPublicIdFromUrl(oldCoverPicUrl);

  // Delete the old picture from Cloudinary
  if (oldPublicId) {
    await deleteImageFromCloudinary(oldPublicId);
  }

  const dp = await uploadOnCloudinary(dpLocalPath);

  if (!dp.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        dp: dp.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Dp image updated successfully"));
});

const updateUserCoverPic = asyncHandler(async (req, res) => {
  const coverPicLocalPath = req.file?.path;

  if (!coverPicLocalPath) {
    throw new ApiError(400, "CoverPic file is missing");
  }

  const user = await User.findById(req.user?._id).select("coverPic");
  const oldCoverPicUrl = user.coverPic;
  const oldPublicId = extractPublicIdFromUrl(oldCoverPicUrl);

  if (oldPublicId) {
    await deleteImageFromCloudinary(oldPublicId);
  }

  const coverPic = await uploadOnCloudinary(coverPicLocalPath);

  if (!coverPic.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverPic: coverPic.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "coverPic image updated successfully")
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing!");
  }
  const profile = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(), //first-pipeline
      },
    },
    {
      $lookup: {
        from: "supports", //model-name=> (lowercase & plural)
        localField: _id,
        foreignField: "supporting",
        as: "supporter",
      },
    },
    {
      $lookup: {
        from: "supports",
        localField: _id,
        foreignField: "supporter",
        as: "supporting",
      },
    },
    {
      $addFields: {
        supportersCount: {
          $size: "$supporter",
        },
        supportingCount: {
          $size: "supporting",
        },
        isSupporter: {
          $cond: {
            if: { $in: [req.user?._id, "$supporter.supporter"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        supportersCount: 1,
        supportingCount: 1,
        isSupporter: 1,
        dp: 1,
        coverPic: 1,
      },
    },
  ]);
  if (!profile?.length) {
    throw new ApiError(404, "Profile does not exist!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, profile[0], "User Profile fetched successfully!")
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserDp,
  updateUserCoverPic,
  getUserProfile,
};
