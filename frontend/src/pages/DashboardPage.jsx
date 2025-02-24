import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import { Upload, File, Trash2, Download, Share2 } from 'lucide-react';

const Alert = ({ variant = 'info', children, onDismiss }) => {
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className={`p-4 rounded-md border ${styles[variant]} relative`}>
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenData = JSON.parse(window.atob(base64));
      setUserId(tokenData.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFiles();
    }
  }, [userId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`http://172.17.0.3:8080/api/files/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Failed to load files');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://172.17.0.3:8080/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      setSuccess('File uploaded successfully!');
      fetchFiles();
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://172.17.0.3:8080/api/files/${fileId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setSuccess('File deleted successfully!');
      fetchFiles();
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    if (!userId) return;

    try {
      const response = await fetch(`http://172.17.0.3:8080/api/files/download/${fileId}?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
  };

const handleShare = async (fileId) => {
  try {
    const response = await fetch(`http://13.60.249.198:8080/api/files/${fileId}/share?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to generate share link');
    }

    const data = await response.json();
    
    // Create temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = data.shareUrl;
    document.body.appendChild(tempInput);
    
    // Select the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Try to use clipboard API first, fall back to document.execCommand
    try {
      await navigator.clipboard.writeText(data.shareUrl);
    } catch (err) {
      document.execCommand('copy');
    } finally {
      // Clean up
      document.body.removeChild(tempInput);
    }
    
    setSuccess('Share link copied to clipboard!');
  } catch (err) {
    setError('Failed to generate share link');
    console.error(err);
  }
};

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const dismissAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">File Upload</h2>
          </div>

          <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-600 focus:outline-none">
            <span className="flex items-center space-x-2">
              <Upload className={uploading ? 'animate-bounce' : ''} />
              <span className="font-medium text-gray-600">
                {uploading ? 'Uploading...' : 'Drop files to Attach, or browse'}
              </span>
            </span>
            <input
              type="file"
              name="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" onDismiss={dismissAlert} className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onDismiss={dismissAlert} className="mb-4">
            {success}
          </Alert>
        )}

        {/* Files List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Files</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {files.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No files uploaded yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.fileId} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <File className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShare(file.fileId)}
                        className="p-2 text-gray-400 hover:text-indigo-600"
                        title="Share file"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(file.fileId, file.fileName)}
                        className="p-2 text-gray-400 hover:text-indigo-600"
                        title="Download file"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.fileId)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete file"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
