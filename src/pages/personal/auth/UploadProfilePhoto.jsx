import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const MAX_SIZE_MB = 5;

// After upload, go to the page that matches selected profession
const PROFESSION_ROUTES = {
  officer: '/officer-category',
  ratings: '/ratings-category',
  catering: '/catering-medical-category',
};

function UploadProfilePhoto() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If no profession selected, send back to select profession
  useEffect(() => {
    const professionType = sessionStorage.getItem('professionType');
    if (!professionType || !PROFESSION_ROUTES[professionType]) {
      navigate('/select-profession', { replace: true });
    }
  }, [navigate]);

  const validateFile = (file) => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG or GIF)');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Photo must be less than ${MAX_SIZE_MB}MB`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFile(file)) return;
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
      if (!validateFile(file)) return;
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please choose a photo to upload');
      return;
    }

    const professionalId = localStorage.getItem('professionalId');
    if (!professionalId) {
      setError('Session expired. Please start registration again.');
      navigate('/signup', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.uploadProfilePhoto(professionalId, selectedFile);
      
      // Save the uploaded photo URL to localStorage for the dashboard layout to show it immediately
      if (response?.data?.url) {
        localStorage.setItem('profileImage', response.data.url);
      }

      const professionType = sessionStorage.getItem('professionType') || 'officer';
      const nextRoute = PROFESSION_ROUTES[professionType] || PROFESSION_ROUTES.officer;
      navigate(nextRoute, { replace: true });
    } catch (err) {
      console.error('Profile photo upload error:', err);
      setError(err.data?.message || err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-5 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          {/* Logo */}
          <div className="mb-2 sm:mb-3 -ml-2">
            <img
              src="/images/logo.png"
              alt="MaritimeLink Logo"
              className="w-24 sm:w-28 h-auto"
            />
          </div>

          {/* Welcome Text */}
          <p className="text-sm text-[#003971] mb-1">Welcome to MaritimeLink</p>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Profile Photo</h1>

          {/* Subtitle */}
          <p className="text-sm text-gray-700 mb-4">Upload a clear professional photo of your face.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors min-h-[200px] flex flex-col items-center justify-center ${isDragging ? 'border-[#003971] bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
            >
              <input
                type="file"
                id="profile-photo-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#003971] bg-gray-100">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile?.size / 1024).toFixed(1)} KB · Click or drop to change
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 overflow-hidden border-2 border-gray-200">
                    <img src="/images/demo-profile.webp" alt="Demo professional profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    <svg
                      className="w-8 h-8 text-gray-400 hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Upload your profile photo</p>
                  <p className="text-xs text-gray-500">JPEG, PNG or GIF · Max {MAX_SIZE_MB}MB</p>
                </div>
              )}
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
                'Continue'
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

      <div className="hidden lg:flex lg:w-3/5 relative min-w-0 py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
        <img
          src="/images/signup-image.webp"
          alt="Maritime Professional"
          className="w-[735px] max-h-full object-cover rounded-[15px]"
        />
      </div>
    </div>
  );
}

export default UploadProfilePhoto;
