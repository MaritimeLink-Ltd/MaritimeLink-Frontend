import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adminTeamService from '../../../services/adminTeamService';

const PASSWORD_HINT = 'At least 8 characters, including a letter and a number.';

const isStrongEnough = (value) =>
    value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

/**
 * /admin/accept-invite/:token — a person invited to the admin team sets their
 * password here and is signed straight in.
 */
function AcceptAdminInvite() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [invitation, setInvitation] = useState(null);
    const [loadError, setLoadError] = useState('');
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await adminTeamService.getInvitation(token);
                if (!cancelled) {
                    if (result) setInvitation(result);
                    else setLoadError('This invitation link is not valid.');
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(
                        err?.data?.message ||
                            err?.message ||
                            'This invitation link is not valid. Ask a super admin to send you a new one.'
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isStrongEnough(password)) {
            setError(`Please choose a stronger password. ${PASSWORD_HINT}`);
            return;
        }
        if (password !== confirmPassword) {
            setError('The two passwords do not match.');
            return;
        }
        setSubmitting(true);
        try {
            await adminTeamService.acceptInvitation(token, {
                password,
                name: name.trim() || undefined,
            });
            navigate('/admin-dashboard', { replace: true });
        } catch (err) {
            setError(
                err?.data?.message || err?.message || 'Could not accept the invitation. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        'block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#003971] focus:border-[#003971] text-sm min-h-[44px]';

    return (
        <div className="min-h-screen flex overflow-hidden">
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white overflow-y-auto py-10">
                <div className="max-w-md w-full mx-auto lg:mx-0">
                    <div className="mb-4 sm:mb-6 -ml-2">
                        <img src="/images/logo.png" alt="MaritimeLink Logo" className="w-24 sm:w-28 h-auto" />
                    </div>
                    <p className="text-sm text-[#003971] mb-1">Welcome to MaritimeLink</p>
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Join the admin team</h1>

                    {loading && <p className="text-sm text-gray-500">Checking your invitation…</p>}

                    {!loading && loadError && (
                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{loadError}</p>
                            </div>
                            <Link to="/admin/login" className="text-sm text-[#003971] hover:underline">
                                Go to admin login
                            </Link>
                        </div>
                    )}

                    {!loading && invitation && (
                        <>
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-gray-700 space-y-1">
                                <p>
                                    You have been invited as{' '}
                                    <strong className="text-gray-900">
                                        {invitation.displayTitle || invitation.roleLabel}
                                    </strong>
                                    .
                                </p>
                                {invitation.accessSummary && (
                                    <p className="text-gray-600">{invitation.accessSummary}</p>
                                )}
                                <p>
                                    Your login email: <strong className="text-gray-900 break-all">{invitation.email}</strong>
                                </p>
                                {invitation.invitedBy && (
                                    <p className="text-gray-500">Invited by {invitation.invitedBy}</p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your name <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        maxLength={80}
                                        autoComplete="name"
                                        className={inputClass}
                                        placeholder="e.g. Sarah Khan"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Create a password
                                    </label>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        className={inputClass}
                                        placeholder="New password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (error) setError('');
                                        }}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">{PASSWORD_HINT}</p>
                                </div>
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        className={inputClass}
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (error) setError('');
                                        }}
                                    />
                                </div>
                                <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                    />
                                    Show passwords
                                </label>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#003971] text-white py-3 px-4 rounded-md hover:bg-[#002855] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                                >
                                    {submitting ? 'Setting up your account…' : 'Accept invitation'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <div className="hidden lg:flex lg:w-3/5 relative py-8 lg:py-12 xl:py-16 pl-4 lg:pl-6 xl:pl-8 pr-8 lg:pr-12 xl:pr-16 items-start justify-center bg-gray-50">
                <img
                    src="/images/login-image.webp"
                    alt="Maritime Professional"
                    className="w-[735px] max-h-full object-cover rounded-[15px]"
                />
            </div>
        </div>
    );
}

export default AcceptAdminInvite;
