import { useState } from 'react';
import { countryCodes } from '../../../../utils/countryCodes';

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
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
              max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-gray-50 focus:bg-opacity-70 text-sm bg-white transition-colors"
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
