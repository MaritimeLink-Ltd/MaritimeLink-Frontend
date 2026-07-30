import { TERMS_META, TERMS_SECTIONS, TERMS_TITLE } from '../../content/termsCopy';

function linkifyText(text) {
    const parts = text.split(/(https?:\/\/[^\s]+|admin@maritimelink\.co|www\.maritimelink\.co)/g);
    return parts.map((part, index) => {
        if (part.match(/^https?:\/\//)) {
            return (
                <a key={index} href={part} className="text-[#003971] hover:underline" target="_blank" rel="noopener noreferrer">
                    {part}
                </a>
            );
        }
        if (part === 'admin@maritimelink.co') {
            return (
                <a key={index} href={`mailto:${part}`} className="text-[#003971] hover:underline">
                    {part}
                </a>
            );
        }
        if (part === 'www.maritimelink.co') {
            return (
                <a key={index} href="https://www.maritimelink.co" className="text-[#003971] hover:underline" target="_blank" rel="noopener noreferrer">
                    {part}
                </a>
            );
        }
        return part;
    });
}

function TermsContent({ className = '' }) {
    return (
        <div className={`space-y-6 ${className}`.trim()}>
            <div className="space-y-1 text-sm text-gray-600">
                {TERMS_META.map((line) => (
                    <p key={line}>{linkifyText(line)}</p>
                ))}
            </div>

            <div className="space-y-8">
                {TERMS_SECTIONS.map((section) => (
                    <section key={section.number}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            {section.number}. {section.title}
                        </h3>
                        <div className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                            {linkifyText(section.content)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export { TERMS_TITLE };
export default TermsContent;
