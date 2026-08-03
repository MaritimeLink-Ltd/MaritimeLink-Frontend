import { useEffect, useState } from 'react';
import resumeService from '../services/resumeService';
import { readUserProfile } from '../utils/kycStatus';
import {
    calculateResumeCompletion,
    getResumeBuilderPath,
    isResumeSubmitted,
    readStoredResumeProgress,
    resolveProfessionType,
    saveResumeProgress,
} from '../utils/resumeProgress';

/** API payload -> the builder's `allData` shape for that profession. */
function mapResumeForProfession(apiData, professionType) {
    if (professionType === 'ratings') return resumeService.mapApiToRatingsData(apiData);
    if (professionType === 'catering') return resumeService.mapApiToCateringData(apiData);
    return resumeService.mapApiToOfficerData(apiData);
}

/**
 * Resume completion for the signed-in professional, measured the same way the
 * builder sidebar measures it.
 *
 * Renders straight away from the progress the builder last saved, then refreshes
 * from the saved resume so the figure stays right after signing in elsewhere.
 *
 * @param {{enabled?: boolean}} [options] - skip the fetch when the caller does not need it
 * @returns {{percent: number, submitted: boolean, isLoading: boolean, professionType: string, builderPath: string}}
 */
export function useResumeProgress({ enabled = true } = {}) {
    const professionType = resolveProfessionType(readUserProfile());
    const [progress, setProgress] = useState(() => readStoredResumeProgress());
    const [isLoading, setIsLoading] = useState(enabled);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return undefined;
        }

        let active = true;

        // `enabled` flips on mid-session: login does not return the account
        // status, so the first render of the dashboard does not know Stage 1 is
        // pending. Raise the flag again here, or the caller renders a 0%
        // "keep building" screen while the real figure is still in flight.
        setIsLoading(true);

        (async () => {
            try {
                const apiData = await resumeService.getResume();
                const percent = calculateResumeCompletion(
                    mapResumeForProfession(apiData, professionType),
                    professionType,
                );

                saveResumeProgress(percent);
                if (active) {
                    setProgress((previous) => ({ ...previous, percent }));
                }
            } catch (error) {
                // No resume saved yet, or the request failed — keep whatever the
                // builder last stored rather than claiming the resume is empty.
                console.log('Resume progress unavailable:', error?.message);
            } finally {
                if (active) setIsLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [enabled, professionType]);

    return {
        percent: Number.isFinite(progress.percent) ? progress.percent : 0,
        submitted: isResumeSubmitted(progress),
        isLoading,
        professionType,
        builderPath: getResumeBuilderPath(professionType),
    };
}

export default useResumeProgress;
