import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, BellRing, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import adminDashboardService from '../../../services/adminDashboardService';

function formatRelative(iso) {
    if (!iso) return 'Just now';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return 'Just now';
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'Just now';
    }
}

function formatAbsolute(iso) {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function mapSeverity(severity) {
    const s = String(severity || '').toLowerCase();
    if (s === 'red') {
        return {
            label: 'Critical',
            dotClass: 'bg-red-500',
            badgeClass: 'bg-red-50 text-red-700',
            icon: ShieldAlert,
        };
    }
    if (s === 'yellow') {
        return {
            label: 'Warning',
            dotClass: 'bg-orange-500',
            badgeClass: 'bg-orange-50 text-orange-700',
            icon: AlertTriangle,
        };
    }
    if (s === 'blue') {
        return {
            label: 'Info',
            dotClass: 'bg-blue-500',
            badgeClass: 'bg-blue-50 text-blue-700',
            icon: Info,
        };
    }
    return {
        label: 'Notice',
        dotClass: 'bg-gray-500',
        badgeClass: 'bg-gray-100 text-gray-700',
        icon: CheckCircle2,
    };
}

function SystemAlerts() {
    const location = useLocation();
    const seededAlerts = Array.isArray(location.state?.alerts) ? location.state.alerts : [];
    const [alerts, setAlerts] = useState(seededAlerts);
    const [loading, setLoading] = useState(seededAlerts.length === 0);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(seededAlerts[0]?.id || null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await adminDashboardService.getDashboardQueues();
                const data = response?.data || {};
                const rawAlerts = Array.isArray(data.systemAlerts) ? data.systemAlerts : [];
                const parsed = rawAlerts.map((alert, index) => ({
                    id: alert?.id || `system-alert-${index}`,
                    type: alert?.type || 'GENERAL',
                    message: alert?.message || 'System alert',
                    severity: alert?.severity || 'blue',
                    timestamp: alert?.timestamp || null,
                }));
                if (cancelled) return;
                setAlerts(parsed);
                if (parsed.length > 0) setSelectedId((prev) => prev || parsed[0].id);
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Could not load system alerts.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const selected = useMemo(
        () => alerts.find((a) => a.id === selectedId) || alerts[0] || null,
        [alerts, selectedId],
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900">System Alerts</h1>
                    <p className="text-sm text-gray-500 mt-1">Live platform alerts and operational anomalies.</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#1e5a8f] bg-blue-50 px-3 py-1.5 rounded-full">
                    <BellRing className="h-3.5 w-3.5" />
                    {loading ? 'Loading…' : `${alerts.length} total`}
                </span>
            </div>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {loading ? (
                        <p className="text-sm text-gray-500 py-10 text-center">Loading system alerts…</p>
                    ) : alerts.length === 0 ? (
                        <p className="text-sm text-gray-500 py-10 text-center">No live system alerts.</p>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert, index) => {
                                const sev = mapSeverity(alert.severity);
                                const isSelected = selected?.id === alert.id;
                                return (
                                    <button
                                        key={alert.id}
                                        type="button"
                                        onClick={() => setSelectedId(alert.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-colors ${
                                            isSelected
                                                ? 'border-[#1e5a8f] bg-blue-50/40'
                                                : 'border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={`h-7 w-7 rounded-full text-white text-xs font-bold flex items-center justify-center ${sev.dotClass}`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-gray-900">{alert.message}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${sev.badgeClass}`}>
                                                        {sev.label}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{formatRelative(alert.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Alert Details</h2>
                    {!selected ? (
                        <p className="text-sm text-gray-500">Select an alert to view details.</p>
                    ) : (
                        <div className="space-y-4">
                            <DetailRow label="Message" value={selected.message} />
                            <DetailRow label="Type" value={selected.type || 'GENERAL'} />
                            <DetailRow label="Severity" value={mapSeverity(selected.severity).label} />
                            <DetailRow label="Occurred" value={formatAbsolute(selected.timestamp)} />
                            <DetailRow label="Source ID" value={selected.id} mono />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, mono = false }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-sm text-gray-900 mt-1 ${mono ? 'font-mono break-all' : ''}`}>{value || 'N/A'}</p>
        </div>
    );
}

export default SystemAlerts;
