function AccountPendingWelcome({ setupHint, reviewMessage, showNoActionRequired = true }) {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#003971] mb-6">
          Welcome to the MaritimeLink
        </h1>
        <div className="space-y-4 text-gray-500 text-base sm:text-lg leading-relaxed">
          <p>Thank you for completing your profile.</p>
          <p>
            {reviewMessage ||
              'Your information and documents are currently under review by our team.'}
          </p>
          {setupHint ? <p>{setupHint}</p> : null}
          {showNoActionRequired ? (
            <p>No further action is required from you at this time.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AccountPendingWelcome;
