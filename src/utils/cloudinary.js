import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) {
      // Check if localfilePath is provided
      console.error("Could not find path");
      return null;
    }

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("file has been uploaded on Cloudinary!", response.url);
    
    fs.unlinkSync(localfilePath);
    return response;


  } catch (error) {
    // removes the locally saved temporary file if the upload operation fails
    fs.unlinkSync(localfilePath);
    return null;
  }
};

export { uploadOnCloudinary };
