import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({
  cloud_name: 'delzaebal',
  api_key: '384476485432495',
  api_secret: 'xTSrAp3kFUJzOLiDqiODx_6nfsQ',
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    console.log('File uploaded successfully:', response.url);
    fs.unlinkSync(localFilePath); // uncomment this line to delete the file from the server
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error('Error uploading file:', error.message);
    return null;
  }
};

export default uploadOnCloudinary;
