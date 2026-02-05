'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Camera, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProfilePictureUploadProps {
    currentPhoto?: string;
    userName: string;
    onPhotoUpdate: (photoUrl: string) => Promise<void>;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export default function ProfilePictureUpload({
    currentPhoto,
    userName,
    onPhotoUpdate,
    disabled = false,
    size = 'large'
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        small: 'w-16 h-16',
        medium: 'w-24 h-24',
        large: 'w-32 h-32'
    };

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            return 'Please upload an image file';
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return 'Image size must be less than 5MB';
        }

        return null;
    };

    const uploadToCloudinary = async (file: File): Promise<string> => {
        try {
            console.log('[ProfilePictureUpload] Requesting Cloudinary signature...');

            // Get signature from backend
            const signRes = await fetch('/api/cloudinary/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: 'crm-profiles' })
            });

            if (!signRes.ok) {
                const errorText = await signRes.text();
                console.error('[ProfilePictureUpload] Signature request failed:', errorText);
                throw new Error('Failed to get upload signature');
            }

            const { signature, timestamp, cloudName, apiKey } = await signRes.json();
            console.log('[ProfilePictureUpload] Got signature, uploading to Cloudinary...');

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp.toString());
            formData.append('api_key', apiKey);
            formData.append('folder', 'crm-profiles');

            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error('[ProfilePictureUpload] Cloudinary upload failed:', errorText);
                throw new Error('Failed to upload image');
            }

            const data = await uploadRes.json();
            console.log('[ProfilePictureUpload] Upload successful:', data.secure_url);
            return data.secure_url;
        } catch (error) {
            console.error('[ProfilePictureUpload] Cloudinary upload error:', error);
            throw error;
        }
    };

    const handleFileSelect = useCallback(async (file: File) => {
        console.log('[ProfilePictureUpload] File selected:', file.name, file.type, file.size);

        // Validate file
        const error = validateFile(file);
        if (error) {
            console.warn('[ProfilePictureUpload] Validation failed:', error);
            toast.error(error);
            return;
        }

        setUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            // Upload to Cloudinary
            console.log('[ProfilePictureUpload] Starting upload...');
            const photoUrl = await uploadToCloudinary(file);

            // Update profile via parent handler
            console.log('[ProfilePictureUpload] Calling onPhotoUpdate...');
            await onPhotoUpdate(photoUrl);

            console.log('[ProfilePictureUpload] Upload complete!');
            toast.success('Profile picture updated successfully!');
            setPreview(null);
        } catch (error: any) {
            console.error('[ProfilePictureUpload] Upload error:', error);
            toast.error(error?.message || 'Failed to upload profile picture');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    }, [onPhotoUpdate]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled || uploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [disabled, uploading, handleFileSelect]);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleClick = () => {
        console.log('[ProfilePictureUpload] Avatar clicked, disabled:', disabled, 'uploading:', uploading);
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log('[ProfilePictureUpload] File input changed, files:', files?.length || 0);
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const displayPhoto = preview || currentPhoto;
    const initials = userName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className={`relative ${sizeClasses[size]} group cursor-pointer`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
            >
                {/* Avatar Display */}
                <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg transition-all ${dragActive ? 'border-orange-500 scale-105' : ''
                    } ${disabled ? 'opacity-50' : ''}`}>
                    {displayPhoto ? (
                        <Image
                            src={displayPhoto}
                            alt={userName}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                            {initials}
                        </div>
                    )}
                </div>

                {/* Overlay on Hover */}
                {!disabled && (
                    <div className={`absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${uploading ? 'opacity-100' : ''
                        }`}>
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                            <Camera className="w-8 h-8 text-white" />
                        )}
                    </div>
                )}

                {/* Upload Success Indicator */}
                {!uploading && preview && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled || uploading}
                />
            </div>

            {/* Upload Instructions */}
            {!disabled && !uploading && (
                <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        Click or drag to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Max size: 5MB
                    </p>
                </div>
            )}

            {/* Uploading State */}
            {uploading && (
                <div className="text-center">
                    <p className="text-sm text-orange-600 font-medium">
                        Uploading...
                    </p>
                </div>
            )}
        </div>
    );
}
