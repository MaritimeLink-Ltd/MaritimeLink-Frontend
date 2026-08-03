/**
 * Dashboard home for a professional who saved a part-finished resume.
 * The "under review" screen (AccountPendingWelcome) only applies once the resume
 * has actually been submitted.
 */
function ResumeProgressWelcome({ completionPercent = 0, onContinue }) {
  const percent = Math.max(0, Math.min(100, Math.round(completionPercent)));

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#003971] mb-6">
          Welcome to MaritimeLink
        </h1>
        <div className="space-y-4 text-gray-500 text-base sm:text-lg leading-relaxed">
          <p>Your profile has been saved and your Resume is {percent}% complete.</p>
          <p>
            Complete your Resume and submit it for review to unlock your Digital Career
            Profile and full access to MaritimeLink.
          </p>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <div
            className="w-full bg-gray-200 rounded-full h-2"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Resume completion"
          >
            <div
              className="bg-[#003971] h-2 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 inline-flex items-center justify-center bg-[#003971] text-white py-3 px-6 rounded-md font-medium hover:bg-[#002855] transition-colors duration-200 min-h-[44px]"
        >
          Continue Building Resume
        </button>
      </div>
    </div>
  );
}

export default ResumeProgressWelcome;
