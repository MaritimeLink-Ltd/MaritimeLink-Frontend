import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Mail, Send, FileText, Shield, LogOut, Trash2, ChevronRight, Crown, X, Check, AlertTriangle, Camera, CircleDot, Loader2 } from 'lucide-react';
import resumeService from '../../../../services/resumeService';
import authService from '../../../../services/authService';
import toast, { Toaster } from 'react-hot-toast';

function resolveProfessionalId() {
    const direct = localStorage.getItem('professionalId');
    if (direct) return direct;
    try {
        const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
        return p.id || p.professionalId || p._id || '';
    } catch {
        return '';
    }
}

const Profile = () => {
    const navigate = useNavigate();
    const [showPremiumPlans, setShowPremiumPlans] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
<<<<<<< Updated upstream
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [profileImage, setProfileImage] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                const userData = JSON.parse(savedProfile);
                const photoFromProfile = userData?.profilePhotoUrl || userData?.profilePhoto || userData?.photo;
                if (photoFromProfile) return photoFromProfile;
            } catch (e) {
                console.error('Error parsing userProfile for profile image:', e);
            }
        }
        return localStorage.getItem('profileImage') || 'https://placehold.co/128x128/e5e7eb/6b7280?text=User';
    });
=======
    const defaultAvatar = 'https://placehold.co/128x128/e5e7eb/6b7280?text=User';
    const [profileImage, setProfileImage] = useState(defaultAvatar);
>>>>>>> Stashed changes
    const [isAvailable, setIsAvailable] = useState(false);
    const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [membershipTier, setMembershipTier] = useState('FREE');
    const [isUpdatingMembership, setIsUpdatingMembership] = useState(false);

    // Get user data from localStorage
    const [userName, setUserName] = useState('User');
    const [userEmail, setUserEmail] = useState('');

    // Fetch user data from Resume API
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accountResponse = await authService.getMyAccount();
                const professional = accountResponse?.data?.professional;
                if (professional) {
                    setIsAvailable(Boolean(professional.availableForWork));
                    setMembershipTier(professional.tier || 'FREE');
                    setUserEmail(professional.email || '');

                    const apiName = professional.fullname || `${professional.firstName || ''} ${professional.lastName || ''}`.trim();
                    if (apiName) setUserName(apiName);

                    if (professional.profilePhotoUrl) {
                        setProfileImage(professional.profilePhotoUrl);
                        localStorage.setItem('profileImage', professional.profilePhotoUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching professional account:', error);
            }

            try {
                // Try to get data from API first
                const resumeData = await resumeService.getResume();
                if (resumeData && resumeData.personalInfo) {
                    const pi = resumeData.personalInfo;
                    const name = (pi.firstName || pi.lastName) 
                        ? `${pi.firstName || ''} ${pi.lastName || ''}`.trim() 
                        : 'User';
                    setUserName(name);
                    setUserEmail(pi.emailAddress || '');

                    if (pi.profilePhoto) {
                        setProfileImage(pi.profilePhoto);
                    }
                    return;
                }
            } catch (error) {
                console.error('Error fetching resume for profile:', error);
            }

            // Fallback to userProfile from localStorage
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                try {
                    const userData = JSON.parse(savedProfile);
                    const name = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.fullName || userData.fullname || 'User' : 'User';
                    setUserName(name);
                    setUserEmail(userData?.email || localStorage.getItem('userEmail') || '');
                    
                    if (userData?.profilePhotoUrl || userData?.profilePhoto || userData?.photo) {
                        const photoUrl = userData.profilePhotoUrl || userData.profilePhoto || userData.photo;
                        setProfileImage(photoUrl);
                    }
                } catch (e) {
                    console.error('Error parsing userProfile:', e);
                }
            } else {
                setUserEmail(localStorage.getItem('userEmail') || '');
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/signin');
        setShowLogoutModal(false);
    };

    const handleFeedbackSubmit = async () => {
        const message = feedbackMessage.trim();
        if (message) {
            try {
                setIsSubmittingFeedback(true);
                await authService.submitFeedback(message);
                setFeedbackSubmitted(true);
                setTimeout(() => {
                    setShowFeedbackModal(false);
                    setFeedbackMessage('');
                    setFeedbackSubmitted(false);
                }, 2000);
            } catch (error) {
                toast.error(error.message || 'Failed to submit feedback', { position: 'top-right' });
            } finally {
                setIsSubmittingFeedback(false);
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeletingAccount(true);
            await authService.deleteAccount();
            toast.success('Account deleted successfully', { position: 'top-right' });
            navigate('/signin');
        } catch (error) {
            toast.error(error.message || 'Failed to delete account', { position: 'top-right' });
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteModal(false);
        }
    };

    const handleAvailabilityToggle = async () => {
        const nextAvailability = !isAvailable;
        setIsAvailable(nextAvailability);

        try {
            setIsUpdatingAvailability(true);
            await authService.updateAvailability(nextAvailability);
            toast.success(nextAvailability ? 'You are now available for work' : 'Availability turned off', { position: 'top-right' });
        } catch (error) {
            setIsAvailable(!nextAvailability);
            toast.error(error.message || 'Failed to update availability', { position: 'top-right' });
        } finally {
            setIsUpdatingAvailability(false);
        }
    };

    const handleMembershipSelect = async (tier) => {
        try {
            setIsUpdatingMembership(true);
            const response = await authService.updateMembership(tier);
            const nextTier = response?.data?.membership?.tier || tier;
            setMembershipTier(nextTier);
            toast.success('Membership updated successfully', { position: 'top-right' });
            setShowPremiumPlans(false);
        } catch (error) {
            toast.error(error.message || 'Failed to update membership', { position: 'top-right' });
        } finally {
            setIsUpdatingMembership(false);
        }
    };

    // Handle profile image upload — calls the real API
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, or GIF)', { position: 'top-right' });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB', { position: 'top-right' });
            return;
        }

        const imageBeforeUpload = profileImage;
        const professionalId = resolveProfessionalId();
        if (!professionalId) {
            toast.error('Professional ID not found. Please log in again.', { position: 'top-right' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            setIsUploadingPhoto(true);
<<<<<<< Updated upstream
            const response = await authService.updateProfilePhoto(file);
=======
            const response = await authService.uploadProfilePhoto(professionalId, file);
>>>>>>> Stashed changes
            const photoUrl = response?.data?.url || response?.data?.photoUrl || response?.data?.profilePhoto;

            if (photoUrl) {
                setProfileImage(photoUrl);
                window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url: photoUrl } }));
                toast.success('Profile photo updated successfully!', { position: 'top-right' });
            } else {
                toast.success('Photo uploaded!', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Profile photo upload error:', error);
            toast.error(error.message || 'Failed to upload photo. Please try again.', { position: 'top-right' });
            setProfileImage(imageBeforeUpload);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // Handle profile image removal
<<<<<<< Updated upstream
    const handleImageRemove = async () => {
        const defaultImage = 'https://placehold.co/128x128/e5e7eb/6b7280?text=User';
        try {
            setIsUploadingPhoto(true);
            await authService.deleteProfilePhoto();
            setProfileImage(defaultImage);
            localStorage.setItem('profileImage', defaultImage);

            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
                try {
                    const profile = JSON.parse(savedProfile);
                    delete profile.profilePhotoUrl;
                    delete profile.profilePhoto;
                    delete profile.photo;
                    localStorage.setItem('userProfile', JSON.stringify(profile));
                } catch (e) { /* ignore */ }
            }

            window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url: defaultImage } }));
            toast.success('Profile photo removed', { position: 'top-right' });
        } catch (error) {
            toast.error(error.message || 'Failed to remove profile photo', { position: 'top-right' });
        } finally {
            setIsUploadingPhoto(false);
        }
=======
    const handleImageRemove = () => {
        setProfileImage(defaultAvatar);
        window.dispatchEvent(new CustomEvent('profileImageUpdated', { detail: { url: defaultAvatar } }));
>>>>>>> Stashed changes
    };

    return (
        <div className="w-full h-full bg-gray-50 overflow-y-auto">
            <Toaster />
            {/* Main Content - Two Column Layout with spacing */}
            <div className="p-4 sm:p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Left Column - Account Settings */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 sm:mb-8">Account settings</h2>

                        {/* Profile Picture and Info */}
                        <div className="flex flex-col items-start mb-6 sm:mb-8">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 overflow-hidden">
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <input
                                    type="file"
                                    id="profile-photo-upload"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    capture="user"
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="profile-photo-upload"
                                    className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                                >
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </label>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{userName}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 mb-2">{userEmail}</p>
                            {/* Availability Badge */}
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3 ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {isAvailable ? 'Available Now' : 'Not Available'}
                            </div>
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="profile-photo-upload"
                                    className="text-sm font-medium text-[#003971] hover:text-[#002855] cursor-pointer"
                                >
                                    Update Photo
                                </label>
                                <button
                                    onClick={handleImageRemove}
                                    disabled={isUploadingPhoto}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isUploadingPhoto ? 'Saving...' : 'Remove'}
                                </button>
                            </div>
                        </div>

                        {/* Maritime Premium Card */}
                        <div
                            onClick={() => setShowPremiumPlans(true)}
                            className="bg-[#003971] rounded-xl p-4 sm:p-5 text-white cursor-pointer hover:bg-[#003971]/90 transition-colors relative"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Crown size={20} />
                                <h4 className="font-semibold text-base">Maritime Premium</h4>
                            </div>
                            <p className="text-sm mb-1">{membershipTier === 'PRO' ? 'Active membership plan' : 'No active membership plan'}</p>
                            <p className="text-sm opacity-90">{membershipTier === 'PRO' ? 'Maritime Premium is active' : 'Click to see available plans'}</p>
                            <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2" size={20} />
                        </div>
                    </div>

                    {/* Right Column - Settings Options */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                        {/* Availability Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Availability</p>
                            <div className="flex items-center justify-between p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CircleDot size={16} className={isAvailable ? 'text-green-500' : 'text-gray-400'} />
                                    <div>
                                        <span className="text-gray-800 text-sm">Available for work</span>
                                        <p className="text-xs text-gray-400 mt-0.5">Let recruiters know you're open to opportunities</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAvailabilityToggle}
                                    disabled={isUpdatingAvailability}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Password</p>
                            <button
                                onClick={() => navigate('/personal/profile/change-password')}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group min-h-[44px]"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock size={16} className="text-[#003971]" />
                                    <span className="text-gray-800 text-sm">Change password</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Subscription</p>
                            <button
                                onClick={() => navigate('/personal/profile/manage-subscription')}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={16} className="text-[#003971]" />
                                    <span className="text-gray-800 text-sm">Manage Subscription</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                            </button>
                        </div>

                        {/* Contact Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Contact</p>
                            <div className="space-y-2">
                                <div className="w-full flex items-center justify-between p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">info@maritime.com</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFeedbackModal(true)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Send size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Send feedback</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Legal Section */}
                        <div className="mb-8">
                            <p className="text-xs text-gray-400 mb-3">Legal</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/personal/terms')}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Terms & condition</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button
                                    onClick={() => navigate('/personal/privacy')}
                                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Privacy policy</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Account Section */}
                        <div>
                            <p className="text-xs text-gray-400 mb-3">Account</p>
                            <div className="space-y-2">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setShowLogoutModal(true)}>
                                    <div className="flex items-center gap-3">
                                        <LogOut size={16} className="text-[#003971]" />
                                        <span className="text-gray-800 text-sm">Log out</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Trash2 size={16} className="text-red-500" />
                                        <span className="text-red-500 text-sm">Delete account</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Plans Modal */}
            {showPremiumPlans && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowPremiumPlans(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-800">Maritime Premium Plans</h2>
                                <button onClick={() => setShowPremiumPlans(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Basic Plan */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£9.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Apply to unlimited jobs</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Basic profile visibility</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Email support</span>
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handleMembershipSelect('FREE')}
                                            disabled={isUpdatingMembership}
                                            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {membershipTier === 'FREE' ? 'Current Plan' : 'Select Plan'}
                                        </button>
                                    </div>

                                    {/* Professional Plan */}
                                    <div className="border-2 border-blue-500 rounded-xl p-6 relative bg-blue-50">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">POPULAR</span>
                                        </div>
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£19.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Everything in Basic</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Priority profile visibility</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Featured in searches</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Priority support</span>
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handleMembershipSelect('PRO')}
                                            disabled={isUpdatingMembership}
                                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {membershipTier === 'PRO' ? 'Current Plan' : 'Select Plan'}
                                        </button>
                                    </div>

                                    {/* Premium Plan */}
                                    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-all">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium</h3>
                                            <div className="mb-4">
                                                <span className="text-4xl font-bold text-gray-800">£29.99</span>
                                                <span className="text-gray-500">/month</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Everything in Professional</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Top profile ranking</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Exclusive job opportunities</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">Dedicated account manager</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-gray-600">24/7 priority support</span>
                                            </li>
                                        </ul>
                                        <button
                                            onClick={() => handleMembershipSelect('PRO')}
                                            disabled={isUpdatingMembership}
                                            className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            {membershipTier === 'PRO' ? 'Current Plan' : 'Select Plan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Send Feedback Modal */}
            {showFeedbackModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {feedbackSubmitted ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
                                    <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Send Feedback</h2>
                                        <button onClick={() => setShowFeedbackModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <X size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={feedbackMessage}
                                        onChange={(e) => setFeedbackMessage(e.target.value)}
                                        placeholder="Share your thoughts, suggestions, or report issues..."
                                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                                    />
                                    <button
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} className="text-red-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Delete Account?</h2>
                                <p className="text-gray-600">This action cannot be undone. All your data, including your resume, applications, and messages will be permanently deleted.</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeletingAccount}
                                    className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowLogoutModal(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} className="text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Logout?</h2>
                                <p className="text-gray-600">Are you sure you want to logout from your account?</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-[#003971] text-white rounded-lg font-medium hover:bg-[#003971]/90 transition-colors"
                                >
                                    Yes, Logout
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;
