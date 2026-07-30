/**
 * Platform commission on course bookings, shown in training-agent disclosure copy.
 *
 * Mirrors `COURSE_COMMISSION_RATE_PERCENT` in the API's `src/config/commission.ts`,
 * which is what actually gets charged. These two must be changed together — the copy
 * previously said 12% while bookings were charged 18%.
 */
export const COURSE_COMMISSION_RATE_PERCENT = 13;
