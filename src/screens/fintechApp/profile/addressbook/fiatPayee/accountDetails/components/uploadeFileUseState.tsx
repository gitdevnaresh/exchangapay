import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ProfileService from '../../../../../../../apiServices/profile';
import { getFileExtension } from '../../../../personalInformation/constants';
import { isErrorDispaly } from '../../../../../../../utils/helpers';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import { useLngTranslation } from '../../../../../../../hooks/languagesHook/useLngTranslation';
import * as DocumentPicker from 'expo-document-picker';
import { checkAppPermissions } from '../../../../../../../services/mediaPermissionService';

export const useImageHandling = (ref: any, setErrormsg: any) => {
    const [backImage, setBackSideImg] = useState({ url: '', name: '' });
    const [frontImage, setFrontImage] = useState({ url: '', name: '' });
    const [uploading, setUploading] = useState(false);
    const [backImgFileLoader, setBackImgFileLoader] = useState(false);
    const [uploadedFrontIdFileName, setUploadedFrontIdFileName] = useState("");
    const [uploadedBackIdFileName, setUploadedBackIdFileName] = useState("");
    const [uploadError, setUploadError] = useState({ frontId: '', backId: '' });
    const { t } = useLngTranslation();
    const [permissionModel, setPermissionModel] = useState<boolean>(false);
    const [permissionTitle, setPermissionTitle] = useState<string>('');
    const [permissionMessage, setPermissionMessage] = useState<string>('');

    const acceptedExtensions = [ADD_RECIPIENT.IMAGE_EXTENSION.JPG, ADD_RECIPIENT.IMAGE_EXTENSION.JPEG, ADD_RECIPIENT.IMAGE_EXTENSION.PNG];

    const verifyFileTypes = (fileList: any) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }
        return true;
    };

    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const pickImage = async (pickerOption?: 'camera' | 'library' | 'documents') => {
        setErrormsg('');
        try {
            // Handle document picker (PDF or image)
            if (pickerOption === 'documents') {
                await new Promise(resolve => setTimeout(resolve, 200));
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['image/*', 'application/pdf'],
                    copyToCacheDirectory: true,
                });

                if (result.canceled) return;

                const selectedFile = result.assets[0];
                const { uri, mimeType, name, size } = selectedFile;
                const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;

                // Check file size (15MB limit)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';
                setUploadedBackIdFileName(fileName);

                // Upload to server
                setBackImgFileLoader(true);
                const formData: any = new FormData();
                formData.append("document", {
                    uri,
                    type: `${type}/${fileExtension}`,
                    name: fileName,
                });

                const uploadRes: any = await ProfileService.uploadFile(formData);
                setBackImgFileLoader(false);

                if (uploadRes.status === 200) {
                    const uploadedFile = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                    setBackSideImg(prev => ({ ...prev, url: uploadedFile, name: fileName }));
                    setUploadError(prev => ({ ...prev, backId: '' }));
                } else {
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    setErrormsg(isErrorDispaly(uploadRes));
                }
                return;
            }
            const res: any = await checkAppPermissions("camera"); // or "library"
            if (res.showPopup) {
                setPermissionTitle(res.titleKey);
                setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_CAPTURE_UPLOAD_PHOTO");
                setTimeout(() => {
                    setPermissionModel(true);
                }, 300);
                return;
            }
            if (!res.allowed) return;

            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                        cameraType: ImagePicker.CameraType.front,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                    });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type, fileSize } = selectedImage;

            // Check file size (15MB limit)
            const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(uri);
            const isValidFileType = verifyFileTypes(fileName);

            if (!isValidFileType) {
                setErrormsg("Accepts only jpg, png, and jpeg format");
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            setUploadedBackIdFileName(fileName);

            // Upload image to server
            if (uri) {
                setBackImgFileLoader(true);
                const formData: any = new FormData();
                formData.append("document", {
                    uri,
                    type: `${type}/${fileExtension}`,
                    name: fileName,
                });

                const uploadRes: any = await ProfileService.uploadFile(formData);
                setBackImgFileLoader(false);

                if (uploadRes.status === 200) {
                    const uploadedImage = uploadRes.data && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                    setBackSideImg(prev => ({ ...prev, url: uploadedImage, name: fileName }));
                    setUploadError(prev => ({ ...prev, backId: '' }));
                } else {
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    setErrormsg(isErrorDispaly(uploadRes));
                }
            }
        } catch (error) {
            setBackImgFileLoader(false);
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
    };


    const closePermissionModel = () => {
        setPermissionModel(false);
    }

    const FrondpickImage = async (pickerOption?: 'camera' | 'library' | 'documents') => {
        try {
            // Handle Document Selection
            if (pickerOption === 'documents') {
                await new Promise(resolve => setTimeout(resolve, 200));
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['image/*', 'application/pdf'],
                    copyToCacheDirectory: true,
                });

                if (result.canceled) return;

                const selectedFile = result.assets[0];
                const { uri, mimeType, name, size } = selectedFile;
                const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;

                // Validate File Size (15 MB)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }

                // Validate File Type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';
                setUploadedFrontIdFileName(fileName);

                // Upload to Server
                setUploading(true);
                const formData: any = new FormData();
                formData.append("document", {
                    uri,
                    type: `${type}/${fileExtension}`,
                    name: fileName,
                });

                const uploadRes: any = await ProfileService.uploadFile(formData);
                setUploading(false);

                if (uploadRes.status === 200) {
                    const uploadedFile = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                    setFrontImage(prev => ({ ...prev, url: uploadedFile, name: fileName }));
                    setUploadError(prev => ({ ...prev, frontId: '' }));
                } else {
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    setErrormsg(isErrorDispaly(uploadRes));
                }
                return;
            }

            const res: any = await checkAppPermissions("camera"); // or "library"
            if (res.showPopup) {
                setPermissionTitle(res.titleKey);
                setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_CAPTURE_UPLOAD_PHOTO");
                setTimeout(() => {
                    setPermissionModel(true);
                }, 300);
                return;
            }
            if (!res.allowed) return;
            // Launch Camera or Library
            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                        cameraType: ImagePicker.CameraType.front,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                    });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type, fileSize } = selectedImage;

            // Check File Size (15 MB limit)
            const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(uri);
            const isValidFileType = verifyFileTypes(fileName);

            if (!isValidFileType) {
                setErrormsg("Accepts only jpg, png, and jpeg format");
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }

            setUploadedFrontIdFileName(fileName);

            // Upload Image
            if (uri) {
                setUploading(true);
                const formData: any = new FormData();
                formData.append("document", {
                    uri,
                    type: `${type}/${fileExtension}`,
                    name: fileName,
                });

                const uploadRes: any = await ProfileService.uploadFile(formData);
                setUploading(false);

                if (uploadRes.status === 200) {
                    const uploadedImage = uploadRes.data && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                    setFrontImage(prev => ({ ...prev, url: uploadedImage, name: fileName }));
                    setUploadError(prev => ({ ...prev, frontId: '' }));
                } else {
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    setErrormsg(isErrorDispaly(uploadRes));
                }
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
    };


    const deleteFrontIdImages = (fileName: any) => {
        if (fileName === "frontIdPhoto") {
            setFrontImage({ url: '', name: '' })
            setUploading(false)
        }
        else {
            setBackSideImg({ url: '', name: '' })
        }
    };

    return {
        backImage,
        setBackSideImg,
        frontImage,
        setFrontImage,
        uploading,
        setUploading,
        backImgFileLoader,
        setBackImgFileLoader,
        uploadedFrontIdFileName,
        setUploadedFrontIdFileName,
        uploadedBackIdFileName,
        setUploadedBackIdFileName,
        uploadError,
        setUploadError,
        pickImage,
        FrondpickImage,
        deleteFrontIdImages,
        setPermissionModel,
        permissionModel,
        closePermissionModel,
        permissionTitle,
        permissionMessage
    };
};