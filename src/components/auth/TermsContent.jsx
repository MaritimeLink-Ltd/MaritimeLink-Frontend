import { TERMS_INTRO, TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../../content/termsCopy';

function TermsContent({ className = '' }) {
    return (
        <div className={`space-y-6 ${className}`.trim()}>
            <p className="font-semibold text-gray-600">Last updated: {TERMS_LAST_UPDATED}</p>
            <p className="text-gray-600 leading-relaxed">{TERMS_INTRO}</p>
            <div className="space-y-6">
                {TERMS_SECTIONS.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{section.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TermsContent;
