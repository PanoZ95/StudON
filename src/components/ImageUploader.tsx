import React, { useState, useRef, ChangeEvent } from 'react';
import { X, Loader2, ImageIcon, Video } from 'lucide-react';
import { uploadPostImage } from '../lib/uploadImage';

interface ImageUploaderProps {
  userId: string;
  onUploaded: (url: string, isVideo: boolean) => void;
}

export default function ImageUploader({ userId, onUploaded }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploaded(false);

    const fileIsVideo = file.type.startsWith('video/');
    setIsVideoPreview(fileIsVideo);

    // Δείχνουμε άμεσα ένα τοπικό preview, πριν ακόμα ξεκινήσει το πραγματικό upload
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const { url, isVideo } = await uploadPostImage(file, userId);
      setUploaded(true);
      onUploaded(url, isVideo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά το ανέβασμα.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setUploaded(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload-input"
      />

      {!previewUrl && (
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container/30 cursor-pointer hover:border-primary-container/60 hover:bg-surface-container/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-on-surface-variant" />
            <Video className="w-5 h-5 text-on-surface-variant" />
          </div>
          <span className="text-sm text-on-surface-variant">Ανέβασε εικόνα ή βίντεο</span>
        </label>
      )}

      {previewUrl && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant/30 bg-black">
          {isVideoPreview ? (
            <video src={previewUrl} className="w-full h-full object-cover" controls muted />
          ) : (
            <img src={previewUrl} alt="Προεπισκόπηση" className="w-full h-full object-cover" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <span className="text-xs text-white">Ανεβαίνει...</span>
            </div>
          )}

          {!uploading && uploaded && (
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
