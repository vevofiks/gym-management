import axios from 'axios';

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gym_members';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Upload an image to Cloudinary
 * @param file The file or blob to upload
 * @param folder The folder to upload to
 * @returns The secure URL of the uploaded image
 */
export const uploadImage = async (file: File | Blob, folder: string = 'members'): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud name is not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image. Please try again.');
    }
};

/**
 * Upload a captured photo from camera
 * @param blob The captured image blob
 * @returns The secure URL of the uploaded image
 */
export const uploadFromCamera = async (blob: Blob): Promise<string> => {
    return uploadImage(blob, 'members/photos');
};

/**
 * Upload a payment screenshot
 * @param file The screenshot file
 * @returns The secure URL of the uploaded image
 */
export const uploadPaymentScreenshot = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'payments/screenshots');
};

/**
 * Upload a tenant payment QR code
 * @param file The QR code image file
 * @returns The secure URL of the uploaded image
 */
export const uploadQRCode = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'tenants/qrcodes');
};
/**
 * Upload a user profile photo
 * @param file The photo file
 * @returns The secure URL of the uploaded image
 */
export const uploadPhoto = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'users/avatars');
};
export const uploadLogo = async (file: File | Blob): Promise<string> => {
    return uploadImage(file, 'tenants/logos');
};
