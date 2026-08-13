import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileImage, UploadCloud, X } from 'lucide-react';
import api from '../../services/api';
import './Upload.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const Upload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileSize = useMemo(() => {
    if (!file) return '';
    return `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setMessage(null);
  };

  const validateFile = (candidate) => {
    if (!candidate) return 'Choose an image file to upload.';
    if (!ACCEPTED_TYPES.includes(candidate.type)) return 'Only JPG, PNG, and GIF images are supported.';
    if (candidate.size > MAX_FILE_SIZE) return 'File size must be 5 MB or less.';
    return '';
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    const error = validateFile(selectedFile);
    if (error) {
      resetSelection();
      setMessage({ type: 'error', text: error });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateFile(file);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage(null);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: response.data.message || 'File uploaded successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>File Upload</h1>
        <p>Upload student photos, card images, or attendance evidence in JPG, PNG, or GIF format.</p>
      </div>

      <form className="upload-container glass-panel" onSubmit={handleSubmit}>
        <label className="file-input-wrapper">
          <input
            className="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            aria-label="Choose image file"
          />
          <span className="file-label">
            {file ? <FileImage className="upload-icon" size={42} /> : <UploadCloud className="upload-icon" size={42} />}
            <span>{file ? 'Change selected file' : 'Choose an image'}</span>
            <small>JPG, PNG, or GIF up to 5 MB</small>
          </span>
        </label>

        {file && (
          <div className="preview-container">
            <img className="image-preview" src={previewUrl} alt={file.name} />
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span>{fileSize}</span>
            </div>
            <button className="btn-clear" type="button" onClick={resetSelection} aria-label="Remove selected file">
              <X size={16} />
              <span>Remove</span>
            </button>
          </div>
        )}

        <button className="btn-upload" type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>

        {message && (
          <div className={`upload-message ${message.type}`} role="status">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Upload;
