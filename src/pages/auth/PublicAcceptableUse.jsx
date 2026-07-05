import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AcceptableUseContent, { ACCEPTABLE_USE_TITLE } from '../../components/auth/AcceptableUseContent';

function PublicAcceptableUse() {
    return (
        <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-white">
            <div className="w-full lg:w-2/5 flex flex-col flex-1 min-h-0 px-6 sm:px-12 lg:px-16 xl:px-24 py-8 overflow-hidden">
                <div className="max-w-md w-full mx-auto lg:mx-0 flex flex-col flex-1 min-h-0 h-full">
                    <div className="mb-4 -ml-2 shrink-0">
                        <img src="/images/logo.png" alt="MaritimeLink Logo" className="w-24 sm:w-28 h-auto" />
                    </div>

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-[#003971] hover:underline mb-4 shrink-0"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 shrink-0">
                        {ACCEPTABLE_USE_TITLE}
                    </h1>

                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                        <AcceptableUseContent />
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:w-3/5 h-full min-h-0 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50 overflow-hidden">
                <img
                    src="/images/signup-image.webp"
                    alt="Maritime professionals"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default PublicAcceptableUse;
