import { useEffect, useState } from 'react';
import { Flag, Loader2, ShieldCheck, X } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';
import reportService, { REPORT_REASONS } from '../../services/reportService';

const MIN_DETAIL_LENGTH = 10;

/**
 * Reports another account for moderation review. Used by professionals,
 * recruiters and training providers from anywhere the other party is on screen
 * (a chat thread, a candidate profile, an applicant record).
 *
 * The backend rejects reports against accounts the reporter has never interacted
 * with, so callers only need to pass the id of someone already in view.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} reportedId        UUID of the account being reported
 * @param {string} reportedName      Display name shown in the confirmation copy
 * @param {string} [conversationId]  Thread that prompted the report, when there is one
 * @param {(report: object) => void} [onSubmitted]
 */
export default function ReportAccountModal({
    isOpen,
    onClose,
    reportedId,
    reportedName = 'this account',
    conversationId,
    onSubmitted,
}) {
    const [reasons, setReasons] = useState(REPORT_REASONS);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submittedReference, setSubmittedReference] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setReason('');
        setDetails('');
        setError('');
        setSubmittedReference('');
        setSubmitting(false);

        let cancelled = false;
        (async () => {
            const list = await reportService.getReasons();
            if (!cancelled) setReasons(list);
        })();
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    const trimmedDetails = details.trim();
    const canSubmit =
        Boolean(reason) && trimmedDetails.length >= MIN_DETAIL_LENGTH && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit || !reportedId) return;
        setSubmitting(true);
        setError('');
        try {
            const report = await reportService.createReport({
                reportedId,
                reason,
                details: trimmedDetails,
                conversationId,
            });
            setSubmittedReference(report?.reference || 'your report');
            onSubmitted?.(report);
        } catch (err) {
            setError(err?.message || 'Could not submit the report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                            <Flag className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Report account</h2>
                            <p className="text-sm text-gray-500">{reportedName}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {submittedReference ? (
                    <div className="px-6 py-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="h-7 w-7 text-green-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">Report submitted</h3>
                        <p className="text-sm text-gray-600 mb-1">
                            Reference <span className="font-semibold">{submittedReference}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Our moderation team will review this account and take action where our
                            policies have been breached.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 px-6 py-2.5 bg-[#003971] text-white rounded-lg text-sm font-semibold hover:bg-[#002855] transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-5 space-y-5">
                            <p className="text-sm text-gray-600">
                                Tell us what is wrong with this account. Reports are confidential —
                                the reported member is not told who filed them.
                            </p>

                            <div>
                                <label
                                    htmlFor="report-reason"
                                    className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                                >
                                    Reason
                                </label>
                                <select
                                    id="report-reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003971]"
                                >
                                    <option value="">Select a reason…</option>
                                    {reasons.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="report-details"
                                    className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                                >
                                    What happened?
                                </label>
                                <textarea
                                    id="report-details"
                                    rows={5}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="Describe the issue with as much detail as you can — dates, messages, and anything else that helps us investigate."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#003971]"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    {trimmedDetails.length < MIN_DETAIL_LENGTH
                                        ? `At least ${MIN_DETAIL_LENGTH} characters.`
                                        : `${trimmedDetails.length} characters`}
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleSubmit()}
                                disabled={!canSubmit}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Submit report
                            </button>
                        </div>
                    </>
                )}
            </div>
        </ModalOverlay>
    );
}
