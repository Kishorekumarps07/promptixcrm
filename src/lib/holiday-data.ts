// 2026 Indian Government Holidays Data
// Source: Government of India Official Holiday List

export const INDIAN_HOLIDAYS_2026 = [
    // ============ NATIONAL HOLIDAYS ============
    {
        date: '2026-01-26',
        name: 'Republic Day',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-03-14',
        name: 'Holi',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-03-30',
        name: 'Good Friday',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-04-02',
        name: 'Eid-ul-Fitr',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-04-10',
        name: 'Mahavir Jayanti',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-04-14',
        name: 'Dr. Ambedkar Jayanti',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-05-01',
        name: 'May Day',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-05-23',
        name: 'Buddha Purnima',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-06-09',
        name: 'Eid-ul-Adha (Bakrid)',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-07-09',
        name: 'Muharram',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-08-15',
        name: 'Independence Day',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-08-16',
        name: 'Janmashtami',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-09-07',
        name: 'Milad-un-Nabi',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-10-02',
        name: 'Gandhi Jayanti',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-10-21',
        name: 'Dussehra',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-10-29',
        name: 'Diwali',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-11-04',
        name: 'Guru Nanak Jayanti',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },
    {
        date: '2026-12-25',
        name: 'Christmas',
        type: 'National',
        region: 'All India',
        isGovernmentHoliday: true
    },

    // ============ TAMIL NADU STATE HOLIDAYS ============
    {
        date: '2026-01-14',
        name: 'Pongal',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    },
    {
        date: '2026-01-15',
        name: 'Thiruvalluvar Day',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    },
    {
        date: '2026-01-16',
        name: 'Uzhavar Thirunal',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    },
    {
        date: '2026-04-14',
        name: 'Tamil New Year',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    },
    {
        date: '2026-09-04',
        name: 'Vinayagar Chaturthi',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    },
    {
        date: '2026-02-01',
        name: 'Thaipoosam',
        type: 'State',
        region: 'Tamil Nadu',
        isGovernmentHoliday: true
    }
];

// Helper function to get holidays by type
export function getHolidaysByType(type: 'National' | 'State' | 'Regional' | 'Custom') {
    return INDIAN_HOLIDAYS_2026.filter(h => h.type === type);
}

// Helper function to get holidays by region
export function getHolidaysByRegion(region: string) {
    return INDIAN_HOLIDAYS_2026.filter(h => h.region === region || h.region === 'All India');
}

// Get all national holidays
export function getNationalHolidays() {
    return getHolidaysByType('National');
}

// Get Tamil Nadu specific holidays
export function getTamilNaduHolidays() {
    return INDIAN_HOLIDAYS_2026.filter(h => h.region === 'Tamil Nadu');
}
