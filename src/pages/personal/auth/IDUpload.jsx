import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

function IDUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.uploadID(selectedFile);
      console.log('ID uploaded successfully:', response);

      // Get stored profession type and navigate accordingly
      const professionType = sessionStorage.getItem('professionType') || 'officer';

      // Redirect to Premium page before category selection (Per Figma Flow)
      navigate('/get-premium', { replace: true });

      /* Original logic moved to GetPremium.jsx
      switch (professionType) {
        case 'officer':
          navigate('/officer-category', { replace: true });
          break;
        case 'ratings':
          navigate('/ratings-category', { replace: true });
          break;
        case 'catering':
          navigate('/catering-medical-category', { replace: true });
          break;
        default:
          navigate('/officer-category', { replace: true });
      }
      */
    } catch (err) {
      console.error('ID upload error:', err);
      setError(err.data?.message || err.message || 'Failed to upload ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-4 sm:mb-6 -ml-2">
            <img
              src="/images/logo.png"
              alt="MaritimeLink Logo"
              className="w-24 sm:w-28 h-auto"
            />
          </div>

          {/* Welcome Text */}
          <p className="text-sm text-[#003971] mb-1">Welcome to MaritimeLink</p>

          {/* ID Upload Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ID Upload</h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-700 mb-6">Upload National ID or Passport</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414              1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                ? 'border-[#003971] bg-blue-50'
                : 'border-gray-300 bg-gray-50'
                }`}
            >
              <input
                type="file"
                id="file-upload"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center">
                {/* Upload Icon */}
                <svg
                  className="w-12 h-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Upload Here</p>
                )}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Next'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-sm text-gray-700">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#003971] font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16">
        <img
          src="/images/signup-image.png"
          alt="Maritime Professional"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
    </div>
  );
}

export default IDUpload;
