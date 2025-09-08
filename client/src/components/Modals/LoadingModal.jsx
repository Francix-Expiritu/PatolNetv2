import React from "react";

const LoadingModal = ({ isOpen, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg p-4 mx-4 shadow-lg">
        <div className="text-center">
          {/* Test Element */}
          <div className="w-20 h-20 bg-red-500 mb-4 mx-auto"></div>

          {/* Spinner */}
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>

          {/* Message */}
          {message && (
            <p className="text-gray-700 text-sm font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;