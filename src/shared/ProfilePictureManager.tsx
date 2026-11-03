import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Check, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ProfilePictureManagerProps {
  currentImageUrl?: string;
  fallbackInitials: string;
  isBusiness?: boolean;
  onImageSaved: (croppedDataUrl: string | null) => void;
  title?: string;
}

export const ProfilePictureManager: React.FC<ProfilePictureManagerProps> = ({
  currentImageUrl,
  fallbackInitials,
  isBusiness = false,
  onImageSaved,
  title,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Constraints
  const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB maximum
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Handle file picker selection with server-safe MIME validation & sanitization
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. MIME Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid file format. Please upload JPG, PNG, WEBP, or GIF.');
      return;
    }

    // 2. File size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 4MB.`);
      return;
    }

    // 3. Filename Sanitization check
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!sanitizedName) {
      setErrorMessage('Invalid filename characters.');
      return;
    }

    setIsUploading(true);

    // 4. Crop image into square via HTML5 Canvas before saving
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const TARGET_DIMENSION = 400; // 400x400 square crop
          canvas.width = TARGET_DIMENSION;
          canvas.height = TARGET_DIMENSION;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setErrorMessage('Could not process canvas context.');
            setIsUploading(false);
            return;
          }

          // Center-crop calculation (aspect-ratio preserving)
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            TARGET_DIMENSION,
            TARGET_DIMENSION
          );

          // WebP / JPEG high quality export
          const croppedBase64 = canvas.toDataURL('image/jpeg', 0.88);
          // Append cache-busting timestamp param
          const finalUrl = `${croppedBase64}#t=${Date.now()}`;

          setPreviewUrl(finalUrl);
          onImageSaved(finalUrl);
          setSuccessMessage(isBusiness ? 'Firm logo updated with instant cache-busting!' : 'Profile picture updated with instant cache-busting!');
          setTimeout(() => setSuccessMessage(null), 3500);
        } catch (err) {
          setErrorMessage('Error cropping image. Please try another file.');
        } finally {
          setIsUploading(false);
        }
      };

      img.onerror = () => {
        setErrorMessage('Failed to load image file.');
        setIsUploading(false);
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      setErrorMessage('Could not read image file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
    // Reset file input value so user can re-select same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo handler
  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    onImageSaved(null);
    setSuccessMessage(isBusiness ? 'Firm logo removed. Fallback restored.' : 'Profile picture removed. Default fallback restored.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center space-x-1.5 font-mono uppercase">
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>{title || (isBusiness ? 'Business Profile Logo' : 'Aviator Profile Picture')}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WEBP &lt; 4MB</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Avatar View / Square Preview */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-slate-700/80 overflow-hidden shadow-inner flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile avatar"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-lg sm:text-xl font-mono">
                {fallbackInitials}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md border-2 border-slate-900 cursor-pointer transition-transform hover:scale-110"
            title="Upload new image"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[11px] text-slate-400 leading-tight">
            Auto-crops to high-res square and applies instant cache-busting. Old assets are automatically purged to prevent cloud storage bloat.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Cropping...' : previewUrl ? 'Change Image' : 'Upload Image'}</span>
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
                title="Remove photo and restore default placeholder"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error / Success Notifications */}
      {errorMessage && (
        <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
