import fs from 'fs';
import path from 'path';

// Mock the API payload based on what the user saw in the debug box:
const apiResponse = {
  resume: {
    id: "uuid-123",
    professionalId: "uuid-456",
    address: "akram abad 2nd street",
    city: "fargosha",
    state: "punjab",
    postcode: "63100",
    country: "Pakistan",
    phoneCode: "+92",
    phoneNumber: "3079888314",
    emailAddress: "devowl14@gmail.com",
    dateOfBirth: "2000-02-09T00:00:00.000Z",
    gender: "MALE",
    height: 543,
    weight: 323,
    bmi: 433
  }
};

// Simulate the unwrapping logic
let result = apiResponse;
if (result && result.resume) {
    const innerResume = result.resume;
    result = { ...result, ...innerResume };
    delete result.resume;
}

const api = result;

const pi = api.personalInfo || api.personal_info || api || {};
const bio = api.biometrics || api.biometric_data || api.biometricsNextOfKin || api || {};

const mapped = {
    personalInfo: {
        firstName: pi.firstName || pi.first_name || '',
        lastName: pi.lastName || pi.last_name || '',
        dateOfBirth: (pi.dateOfBirth || pi.date_of_birth || '').split('T')[0],
        streetAddress: pi.address || pi.street_address || '',
        city: pi.city || '',
        state: pi.state || ''
    },
    biometricsNextOfKin: {
        biometricData: {
            gender: bio.gender || 'Male',
            height: bio.height || bio.height_cm || '',
            weight: bio.weight || bio.weight_kg || '',
            bmi: bio.bmi || ''
        }
    }
};

console.log(JSON.stringify(mapped, null, 2));
