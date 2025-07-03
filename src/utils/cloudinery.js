import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Method to upload from local server to Cloudinary
const uploadonCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        console.log("File uploaded successfully to Cloudinary:", response.url);

        // Delete the local file after successful upload
        fs.unlinkSync(localfilepath);

        return response;
    } catch (error) {
        // Delete the file even if upload fails to avoid leftover junk
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}

export { uploadonCloudinary }
