import React, { useState, useEffect } from 'react';

function FileList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // TODO: Implement file fetching
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Files</h2>
      <div className="space-y-4">
        {files.map(file => (
          <div key={file.id} className="p-4 border rounded">
            {file.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;