// AdminPage.jsx
import React, {useState, useEffect} from 'react';
import {useAuth} from '../hooks/useAuth';
import {Navigate} from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {Users, File, Trash2, Share2, AlertCircle, CheckCircle2} from 'lucide-react';

const Alert = ({message, type, onDismiss}) => (
    <div className={`p-4 rounded-md mb-4 flex items-start justify-between ${
        type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
    }`}>
        <div className="flex">
            {type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2"/>
            ) : (
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 mr-2"/>
            )}
            <p>{message}</p>
        </div>
        {onDismiss && (
            <button
                onClick={onDismiss}
                className="ml-4 text-gray-400 hover:text-gray-600"
            >
                ×
            </button>
        )}
    </div>
);

const AdminPage = () => {
    const {user} = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userFiles, setUserFiles] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Verificare rol admin - mutată după hooks
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard"/>;
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://172.17.0.3:8080/api/users/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.filter(user => user.role === 'user'));
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserFiles = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://172.17.0.3:8080/api/files/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch user files');
            const data = await response.json();
            setUserFiles(data);
            setError(null);
        } catch (err) {
            setError('Failed to load user files');
            setUserFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = async (user) => {
        setSelectedUser(user);
        await fetchUserFiles(user.userId);
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`http://172.17.0.3:8080/api/files/${fileId}?userId=${selectedUser.userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Delete failed');

            setSuccess('File deleted successfully!');
            fetchUserFiles(selectedUser.userId);
        } catch (err) {
            setError('Failed to delete file');
        }
    };


        const handleShare = async (fileId) => {
            try {
                 const response = await fetch(`http://13.60.249.198:8080/api/files/${fileId}/share?userId=${selectedUser.userId}`, {
                     method: 'POST',
                     headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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

    return (
        <DashboardLayout>
            <div className="px-4 py-6 sm:px-0">
                <div className="flex gap-6">
                    {/* Users List Section */}
                    <div className="w-1/3">
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <Users className="h-6 w-6 mr-2"/>
                                Users
                            </h2>
                            {loading && !selectedUser ? (
                                <div className="py-4 text-center">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <button
                                            key={user.userId}
                                            onClick={() => handleUserSelect(user)}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none rounded-md transition-colors ${
                                                selectedUser?.userId === user.userId ? 'bg-indigo-50' : ''
                                            }`}
                                        >
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Files List Section */}
                    <div className="w-2/3">
                        <div className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {selectedUser ? `Files for ${selectedUser.username}` : 'Select a user to view their files'}
                            </h2>

                            {error && (
                                <Alert
                                    message={error}
                                    type="error"
                                    onDismiss={dismissAlert}
                                />
                            )}

                            {success && (
                                <Alert
                                    message={success}
                                    type="success"
                                    onDismiss={dismissAlert}
                                />
                            )}

                            {loading && selectedUser ? (
                                <div className="py-4 text-center">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                </div>
                            ) : (
                                selectedUser && (
                                    <div className="divide-y divide-gray-200">
                                        {userFiles.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">No files found</p>
                                        ) : (
                                            userFiles.map((file) => (
                                                <div key={file.fileId}
                                                     className="py-4 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <File className="h-6 w-6 text-gray-400 mr-3"/>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                                                            <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleShare(file.fileId)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors"
                                                            title="Share file"
                                                        >
                                                            <Share2 className="h-5 w-5"/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(file.fileId)}
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                                            title="Delete file"
                                                        >
                                                            <Trash2 className="h-5 w-5"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPage;
