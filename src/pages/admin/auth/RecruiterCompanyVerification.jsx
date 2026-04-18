import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';

const COMPANY_VERIFICATION_STORAGE_KEY = 'companyVerificationDecision';

function mapLookupToDisplay(lookupPayload) {
    const root = lookupPayload && typeof lookupPayload === 'object' ? lookupPayload : {};
    const d = root.company && typeof root.company === 'object' ? root.company : root;

    return {
        logo: d.logo || d.logoUrl || d.companyLogo || '',
        name: d.organizationName || d.name || d.companyName || '',
        website: d.company_website || d.website || d.url || '',
        address: [d.address_street, d.address_location].filter(Boolean).join(', '),
        city: d.address_city || '',
        state: d.country_region || '',
        postcode: d.zip_code || '',
        country: d.country_name || d.country_code || '',
        linkedin: d.linkedin || '',
        source: d.source || root.source || '',
        sources: d.sources || root.sources || [],
        raw: d,
    };
}

function getLookupPayload(response) {
    if (!response || typeof response !== 'object') return null;
    return response.data || response;
}

function RecruiterCompanyVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    const formData = location.state?.formData;
    const [lookupPreview, setLookupPreview] = useState(location.state?.lookupPreview || null);
    const verification = location.state?.verification;
    const fromState = lookupPreview || location.state?.companyData;

    const companyData = fromState || {
        logo: lookupPreview?.logo || '',
        name: formData?.companyName || lookupPreview?.name || '',
        website: formData?.website || lookupPreview?.website || '',
    };

    const showLookupCompare =
        lookupPreview?.name &&
        formData?.companyName &&
        lookupPreview.name.trim().toLowerCase() !== formData.companyName.trim().toLowerCase();

    useEffect(() => {
        const lookupCompany = async () => {
            if (lookupPreview || !formData?.companyName) return;

            setLookupLoading(true);
            setLookupError('');

            try {
                const response = await authService.lookupCompanyDetails({
                    organizationName: formData.companyName,
                    url: formData.website,
                    address: formData.address,
                    companyCity: formData.city,
                    companyState: formData.stateProvince,
                    companyZip: formData.postcode,
                    companyCountry: formData.country,
                    companyLinkedIn: formData.linkedIn,
                });
                const payload = getLookupPayload(response);
                const mapped = mapLookupToDisplay(payload);
                setLookupPreview(mapped);
            } catch (err) {
                console.error('Company verification lookup failed:', err);
                setLookupError('We could not fetch public company details right now. You can continue with your entered details.');
            } finally {
                setLookupLoading(false);
            }
        };

        lookupCompany();
    }, [formData, lookupPreview]);

    const saveDecision = ({ organizationVerified, useManualDetails }) => {
        const decision = {
            organizationVerified,
            useManualDetails,
            riskLevel: organizationVerified ? 'LOW' : 'HIGH',
            source: organizationVerified ? (verification?.source || lookupPreview?.source || 'GEMINI_GOOGLE_SEARCH') : 'USER_DECLINED_LOOKUP',
            selectedCompany: organizationVerified ? companyData : null,
            enteredCompany: formData || null,
            decidedAt: new Date().toISOString(),
        };

        localStorage.setItem(COMPANY_VERIFICATION_STORAGE_KEY, JSON.stringify(decision));
        return decision;
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const decision = saveDecision({
                organizationVerified: true,
                useManualDetails: false,
            });

            navigate('/agent/compliance-declaration', {
                state: {
                    companyData,
                    lookupPreview,
                    verification: {
                        ...verification,
                        ...decision,
                    },
                },
            });
        } catch (err) {
            console.error('Company confirmation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => {
        const decision = saveDecision({
            organizationVerified: false,
            useManualDetails: true,
        });

        navigate('/agent/compliance-declaration', {
            state: {
                useManualDetails: true,
                companyData: formData || companyData,
                lookupPreview,
                verification: {
                    ...verification,
                    ...decision,
                },
            },
        });
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img
                            src="/images/logo.png"
                            alt="MaritimeLink Logo"
                            className="w-20 sm:w-24 h-auto"
                        />
                    </div>

                    <p className="text-sm text-gray-700 mb-1">Welcome to MaritimeLink</p>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirm your organization</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        We use public web sources to help verify company details. Please confirm this is the organization you represent.
                    </p>

                    {lookupLoading && (
                        <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm font-semibold text-[#003971]">Fetching public company details...</p>
                            <p className="text-sm text-gray-600 mt-1">We are checking the organization name against public web sources.</p>
                        </div>
                    )}

                    {lookupError && (
                        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">{lookupError}</p>
                        </div>
                    )}

                    {showLookupCompare && (
                        <div className="mb-4 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <p>
                                <span className="font-semibold text-gray-800">You entered:</span>{' '}
                                {formData.companyName}
                            </p>
                            <p className="mt-1">
                                <span className="font-semibold text-gray-800">Public lookup suggested:</span>{' '}
                                {lookupPreview.name}
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-2xl p-8 mb-6 flex flex-col items-center">
                        {companyData.logo && (
                            <img
                                src={companyData.logo}
                                alt={`${companyData.name || 'Company'} logo`}
                                className="w-32 h-32 object-contain mb-4"
                            />
                        )}

                        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">{companyData.name}</h2>

                        {companyData.website && (
                            <p className="text-sm text-gray-600 break-all text-center">{companyData.website}</p>
                        )}

                        {(companyData.address || companyData.city || companyData.country) && (
                            <p className="mt-3 text-xs text-gray-500 text-center">
                                {[companyData.address, companyData.city, companyData.state, companyData.postcode, companyData.country]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        )}

                        {companyData.source && (
                            <p className="mt-3 text-[11px] font-semibold text-[#003971] uppercase tracking-wide">
                                Verified using public search
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] mb-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Continuing...
                            </>
                        ) : (
                            'Yes, this is my organization'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleDecline}
                        disabled={loading}
                        className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                        No — this is not my organization; I will use my entered details
                    </button>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime Professional"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default RecruiterCompanyVerification;
