import { useState, useRef } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { API_ORIGIN } from '../config.js';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isImageType(type) {
  return type?.startsWith('image/');
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Generic document icon used for any non-image attachment (pdf, docx, zip, etc.)
function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function TaskAttachment({ task }) {
  const { uploadAttachment, removeAttachment } = useTasks();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const hasAttachment = !!task?.attachmentPath;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = 'Unsupported file type. Allowed: images, PDF, Word, Excel, TXT, CSV, ZIP.';
      setError(msg);
      addToast(msg, 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      const msg = 'File must be smaller than 10MB.';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(isImageType(file.type) ? URL.createObjectURL(file) : null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
  };

  const resetSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || !task?.id) return;
    setUploading(true);
    setProgress(0);
    try {
      await uploadAttachment(task.id, selectedFile, setProgress);
      addToast('Attachment uploaded successfully!', 'success');
      resetSelection();
    } catch (err) {
      setError(err.message || 'Upload failed.');
      addToast(err.message || 'Failed to upload attachment.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!task?.id) return;
    setRemoving(true);
    try {
      await removeAttachment(task.id);
      addToast('Attachment removed.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to remove attachment.', 'error');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-dark-300 mb-2">Attachment</label>

      {/* Existing attachment on the task */}
      {hasAttachment && !selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-dark-800/60 border border-dark-700/50 rounded-xl mb-3">
          {isImageType(task.attachmentType) ? (
            <img
              src={`${API_ORIGIN}${task.attachmentPath}`}
              alt={task.attachmentName}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-dark-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-dark-700/60 text-dark-300 flex items-center justify-center flex-shrink-0">
              <FileIcon />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{task.attachmentName}</p>
            <p className="text-xs text-dark-500">{formatSize(task.attachmentSize)}</p>
          </div>
          <a
            href={`${API_ORIGIN}${task.attachmentPath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 rounded-lg transition-colors"
          >
            {isImageType(task.attachmentType) ? 'View' : 'Download'}
          </a>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {removing ? '...' : 'Remove'}
          </button>
        </div>
      )}

      {/* Drag & drop / picker for a new upload */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!uploading ? () => fileInputRef.current.click() : undefined}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-brand-400 bg-brand-500/5'
            : 'border-dark-700/60 bg-dark-900/10 hover:border-dark-600 hover:bg-dark-900/20'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {!selectedFile ? (
          <p className="text-xs text-dark-400">
            Drag & drop a file, or <span className="text-brand-400 hover:underline">browse</span>
            <br />
            <span className="text-dark-600">Images, PDF, Word, Excel, TXT, CSV, ZIP · max 10MB</span>
          </p>
        ) : (
          <div className="flex items-center gap-3 text-left">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-dark-700/60 text-dark-300 flex items-center justify-center flex-shrink-0">
                <FileIcon />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-dark-500">{formatSize(selectedFile.size)}</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-400 mt-2">{error}</p>}

      {selectedFile && (
        <div className="mt-3 space-y-2">
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-dark-400">Uploading...</span>
                <span className="text-brand-400">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {!uploading && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetSelection}
                className="flex-1 py-2 text-xs font-medium text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 rounded-lg transition-all"
              >
                Upload
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
