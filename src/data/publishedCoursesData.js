import {
    BookOpen,
    Flame,
    LifeBuoy,
    Shield,
    Anchor,
} from 'lucide-react';

export const mockCourses = [
    {
        id: 1,
        name: 'STCW Basic Safety',
        certificateType: 'STCW Basic Safety',
        sessions: 10,
        totalSeats: 160,
        bookings: 123,
        revenue: '$18,450',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'Cheical Tahours',
        icon: BookOpen,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600'
    },
    {
        id: 2,
        name: 'Advanced Firefighting',
        certificateType: 'Advanced Firefighting',
        sessions: 9,
        totalSeats: 150,
        bookings: 102,
        revenue: '$17,850',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'Cheical Tahours',
        icon: Flame,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600'
    },
    {
        id: 3,
        name: 'Fast Rescue Boat Operator',
        certificateType: 'Fast Rescue Boat',
        sessions: 8,
        totalSeats: 80,
        bookings: 75,
        revenue: '$14,250',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'Tormt C3pass',
        icon: LifeBuoy,
        iconBg: 'bg-pink-50',
        iconColor: 'text-pink-600',
        bookingsTag: {
            label: 'Full',
            className: 'bg-orange-100 text-orange-700'
        }
    },
    {
        id: 4,
        name: 'Confined Space Awareness',
        certificateType: 'Confined Space',
        sessions: 6,
        totalSeats: 72,
        bookings: 61,
        revenue: '$12,200',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'Fabetca Uhmss',
        icon: Shield,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
    },
    {
        id: 5,
        name: 'Medical Care Onboard',
        certificateType: 'Medical Care Onboard',
        sessions: 5,
        totalSeats: 60,
        bookings: 50,
        revenue: '$9,850',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'BC1- 859093',
        icon: Anchor,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600'
    },
    {
        id: 6,
        name: 'ECDIS',
        certificateType: 'ECDIS',
        sessions: 4,
        totalSeats: 48,
        bookings: 14,
        revenue: '$3,300',
        status: 'Draft',
        statusVariant: 'warning',
        instructor: '12 e 6hhbods',
        icon: BookOpen,
        iconBg: 'bg-sky-50',
        iconColor: 'text-sky-600'
    },
    {
        id: 7,
        name: 'Chemical Tanker',
        certificateType: 'Chemical Tanker',
        sessions: 4,
        totalSeats: 52,
        bookings: 19,
        revenue: '$4,050',
        status: 'Published',
        statusVariant: 'success',
        instructor: 'Typpoon 13hhors',
        icon: Flame,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600'
    },
    {
        id: 8,
        name: 'GWO Sea Survival',
        certificateType: 'GWO Sea Survival',
        sessions: 3,
        totalSeats: 45,
        bookings: 11,
        revenue: '$2,300',
        status: 'Archived',
        statusVariant: 'neutral',
        instructor: 'Wimcl C7ilters',
        icon: LifeBuoy,
        iconBg: 'bg-cyan-50',
        iconColor: 'text-cyan-600'
    }
];

// Only published courses for the session scheduling dropdown
export const publishedCourses = mockCourses
    .filter(course => course.status === 'Published')
    .map(course => ({ id: course.id, name: course.name }));
