{/* Academic Qualification Section - For Officers */ }
{
    userData.userType === 'officer' && userData.academicQualifications && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">Academic Qualification</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Dates</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Qualification Name</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Institution</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {userData.academicQualifications.map((qual, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-5 py-4 text-sm text-gray-700">{qual.dates}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{qual.qualificationName}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{qual.institution}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{qual.grade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{/* STCW Certificates Section - For Officers */ }
{
    userData.userType === 'officer' && userData.stcwCertificates && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">STCW Certificates</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">STCW Qualification</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Certificate Number</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {userData.stcwCertificates.map((cert, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.stcwQualification}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateNumber}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.issuingCountry}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.dateOfIssue}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.validTill}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{/* Medical Certificates Section - For Officers */ }
{
    userData.userType === 'officer' && userData.medicalCertificates && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">Medical Certificates</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Certificate Name</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Certificate Number</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {userData.medicalCertificates.map((cert, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateName}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.certificateNumber}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.issuingCountry}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.dateOfIssue}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{cert.validTill}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{/* Travel Documents Section - For Officers */ }
{
    userData.userType === 'officer' && userData.travelDocuments && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">Travel Documents</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Document Name</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Document Number</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Issuing Country</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Date Of Issue</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Valid Till</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {userData.travelDocuments.map((doc, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-5 py-4 text-sm text-gray-700">{doc.documentName}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{doc.documentNumber}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{doc.issuingCountry}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{doc.dateOfIssue}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{doc.validTill}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{/* Biometrics Section - For Officers */ }
{
    userData.userType === 'officer' && userData.biometricInfo && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">Biometrics</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Gender</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Height</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Weight</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Eye Color</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Overall Size</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Shoe Size</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        <tr className="border-b border-gray-200">
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.gender}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.height}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.weight}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.eyeColor}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.overallSize}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{userData.biometricInfo.shoeSize}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

{/* Next Of Kin Section - For Officers */ }
{
    userData.userType === 'officer' && userData.nextOfKin && (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-5">
                <FiBriefcase size={20} className="text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">Next Of Kin</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#1E3A5F] text-white">
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tl-lg">Name</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Relationship</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold">Phone Number</th>
                            <th className="px-5 py-3.5 text-left text-sm font-semibold rounded-tr-lg">Email</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {userData.nextOfKin.map((kin, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                <td className="px-5 py-4 text-sm text-gray-700">{kin.name}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{kin.relationship}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{kin.phoneNumber}</td>
                                <td className="px-5 py-4 text-sm text-gray-700">{kin.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
