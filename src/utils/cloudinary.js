import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

// Verify configuration
if (
  !cloudinaryConfig.cloud_name ||
  !cloudinaryConfig.api_key ||
  !cloudinaryConfig.api_secret
) {
  console.error('Missing Cloudinary credentials:', {
    cloud_name: !!cloudinaryConfig.cloud_name,
    api_key: !!cloudinaryConfig.api_key,
    api_secret: !!cloudinaryConfig.api_secret,
  });
  throw new Error('Cloudinary configuration is incomplete');
}

cloudinary.config(cloudinaryConfig);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    console.log('Attempting to upload file:', localFilePath);
    console.log('Using Cloudinary config:', {
      cloud_name: cloudinaryConfig.cloud_name,
      api_key: cloudinaryConfig.api_key?.substring(0, 5) + '...',
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log('File uploaded successfully:', response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error('Detailed upload error:', {
      message: error.message,
      code: error.code,
      http_code: error.http_code,
    });

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

// const deleteFromCloudinary = async (publicId) => {
//   try {
//     if (!publicId) return null;

//     console.log('Attempting to delete file:', publicId);
//     console.log('Using Cloudinary config:', {
//       cloud_name: cloudinaryConfig.cloud_name,
//       api_key: cloudinaryConfig.api_key?.substring(0, 5) + '...',
//     });

//     const response = await cloudinary.uploader.destroy(publicId);

//     console.log('File deleted successfully:', response.result);
//     return response;
//   } catch (error) {
//     console.error('Detailed delete error:', {
//       message: error.message,
//       code: error.code,
//       http_code: error.http_code,
//     });
//     return null;
//   }
// };

export default uploadOnCloudinary;
