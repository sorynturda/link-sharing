
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Alert } from '@/components/ui/alert';

const FileList = ({ onFileDeleted }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await api.get(`/files/user/${user.id}`);
      setFiles(response.data);
    } catch (err) {
      setError('Error fetching files');
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await api.get(`/files/download/${fileId}?userId=${user.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', files.find(f => f.fileId === fileId).fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error downloading file');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}?userId=${user.id}`);
      setFiles(files.filter(f => f.fileId !== fileId));
      if (onFileDeleted) onFileDeleted();
    } catch (err) {
      setError('Error deleting file');
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <p>{error}</p>
        </Alert>
      )}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {files.map((file) => (
            <li key={file.fileId} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(file.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDownload(file.fileId)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.fileId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};