import { useState } from 'react';

const PersonalInfo = ({ onNext, initialData = {} }) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    address: initialData.address || '',
    countryCode: initialData.countryCode || '+92',
    contactNumber: initialData.contactNumber || '',
    email: initialData.email || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <form className="flex flex-col h-full justify-between">
      <div className="space-y-3">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1 text-sm">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
          />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-gray-700 font-medium mb-1 text-sm">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
          />
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
              className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
            >
              <option value="+92">🇵🇰 +92</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
            </select>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              placeholder="Enter your contact number"
              value={formData.contactNumber}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="bg-[#003971] text-white py-2 px-10 rounded-lg font-medium hover:bg-[#002855] transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default PersonalInfo;
