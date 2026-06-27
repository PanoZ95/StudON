import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadPostImage } from '../lib/uploadImage';

interface ImageUploaderProps {
  userId: string;
  onUploaded: (publicUrl: string) => void;
}

export default function ImageUploader({ userId, onUploaded }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadedUrl(null);

    // Δείχνουμε άμεσα ένα τοπικό preview, πριν ακόμα ξεκινήσει το πραγματικό upload
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const publicUrl = await uploadPostImage(file, userId);
      setUploadedUrl(publicUrl);
      onUploaded(publicUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά το ανέβασμα.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploadedUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload-input"
      />

      {!previewUrl && (
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container/30 cursor-pointer hover:border-primary-container/60 hover:bg-surface-container/50 transition-all"
        >
          <ImageIcon className="w-6 h-6 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">Ανέβασε εικόνα</span>
        </label>
      )}

      {previewUrl && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant/30">
          <img src={previewUrl} alt="Προεπισκόπηση" className="w-full h-full object-cover" />

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-xs text-white">Ανεβαίνει...</span>
            </div>
          )}

          {!uploading && uploadedUrl && (
            <button
              onClick={handleRemove}
              type="button"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2 mt-2">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
