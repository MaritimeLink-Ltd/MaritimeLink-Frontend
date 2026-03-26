import { useState, useEffect } from 'react';
import { countryCodes } from '../../../../utils/countryCodes';

const PersonalInfo = ({ onNext, initialData = {}, isLoading = false, apiError = null }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    middleName: initialData.middleName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    streetAddress: initialData.streetAddress || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zipCode: initialData.zipCode || '',
    country: initialData.country || '',
    countryCode: initialData.countryCode || '+44',
    contactNumber: initialData.contactNumber || '',
    email: initialData.email || ''
  });

  // Sync when initialData arrives asynchronously (e.g. from API fetch)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        firstName: initialData.firstName || '',
        middleName: initialData.middleName || '',
        lastName: initialData.lastName || '',
        dateOfBirth: initialData.dateOfBirth || '',
        streetAddress: initialData.streetAddress || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        country: initialData.country || '',
        countryCode: initialData.countryCode || '+44',
        contactNumber: initialData.contactNumber || '',
        email: initialData.email || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-detect country code when typing in contact number
    if (name === 'contactNumber') {
      const matchedCode = countryCodes.find(country =>
        value.startsWith(country.code)
      );
      if (matchedCode && value.startsWith('+')) {
        setFormData({
          ...formData,
          countryCode: matchedCode.code,
          contactNumber: value.slice(matchedCode.code.length)
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full justify-between" >
      <div className="space-y-3">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-gray-700 font-medium mb-1 text-sm">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="middleName" className="block text-gray-700 font-medium mb-1 text-sm">
              Middle Name (Optional)
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-gray-700 font-medium mb-1 text-sm">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-1 text-sm">
            Date Of Birth
          </label>
          <div className="relative">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              placeholder="Enter your date of birth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Address
          </label>
          <div className="space-y-3">
            <input
              type="text"
              name="streetAddress"
              placeholder="Street Address"
              value={formData.streetAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
              />
              <input
                type="text"
                name="state"
                placeholder="State / Province"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP / Postal Code"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contactNumber" className="block text-gray-700 font-medium mb-1 text-sm">
            Contact Number
          </label>
          <div className="flex space-x-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="w-32 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            >
              {countryCodes.map((country) => (
                <option key={country.code + country.country} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              placeholder="Enter your contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1 text-sm">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
          />
        </div>
      </div>

      {/* Next Button and Error */}
      <div className="flex flex-col items-end pt-4 space-y-3" >
        {apiError && (
          <div className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100 mb-2">
            {apiError}
          </div>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Next'
          )}
        </button>
      </div >
    </form >
  );
};

export default PersonalInfo;
