import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authApi } from '../services/authApi.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AvatarUpload() {
  const { token, user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return false;

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = 'Only JPG, PNG, WEBP, or GIF images are allowed.';
      setError(msg);
      addToast(msg, 'error');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const msg = 'File must be smaller than 5MB.';
      setError(msg);
      addToast(msg, 'error');
      return false;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await authApi.uploadAvatar(token, selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (res.success) {
        addToast('Profile picture updated successfully!', 'success');
        updateUser({ avatarPath: res.avatarPath });
        resetSelection();
      } else {
        throw new Error(res.message || 'Failed to upload avatar');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      addToast(err.message || 'Failed to upload avatar.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-dark-900/60 border border-dark-800/80 rounded-2xl p-6 shadow-xl max-w-md mx-auto w-full transition-all hover:border-dark-700/60">
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-400">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Update Profile Picture
      </h3>

      {/* Styled drag and drop container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? triggerFileInput : undefined}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-brand-400 bg-brand-500/5'
            : previewUrl
            ? 'border-dark-700 bg-dark-900/30'
            : 'border-dark-800 bg-dark-900/10 hover:border-dark-700 hover:bg-dark-900/20'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {!previewUrl ? (
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center text-dark-400 group-hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                Drag and drop image, or <span className="text-brand-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-dark-500">Supports JPG, PNG, WEBP, or GIF (max 5MB)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-brand-500/40 shadow-inner group">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white truncate max-w-[240px]">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-dark-500">
                {(selectedFile?.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <p className="text-xs font-medium text-red-400 mt-3 text-center">{error}</p>
      )}

      {/* Uploading states & actions */}
      {previewUrl && (
        <div className="mt-5 space-y-4">
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-dark-400">Uploading...</span>
                <span className="text-brand-400">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetSelection}
                className="flex-1 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-sm font-medium text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="flex-1 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-sm font-semibold text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all"
              >
                Upload Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
