import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Successfully Authenticated!
            </h2>
            <p className="text-gray-600">
              You are now viewing the protected dashboard page.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;