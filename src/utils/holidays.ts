import { isSameDay } from 'date-fns';

export interface Holiday {
    date: Date;
    name: string;
}

export const TN_HOLIDAYS_2026: Holiday[] = [
    { date: new Date('2026-01-01'), name: 'New Year\'s Day' },
    { date: new Date('2026-01-15'), name: 'Pongal' },
    { date: new Date('2026-01-16'), name: 'Maattu Pongal' },
    { date: new Date('2026-01-17'), name: 'Uzhavar Thirunal' },
    { date: new Date('2026-01-26'), name: 'Republic Day' },
    { date: new Date('2026-02-01'), name: 'Thai Poosam' },
    { date: new Date('2026-03-19'), name: 'Telugu New Year' },
    { date: new Date('2026-03-21'), name: 'Ramzan (Id-ul-Fitr)' },
    { date: new Date('2026-03-31'), name: 'Mahaveer Jayanthi' },
    { date: new Date('2026-04-03'), name: 'Good Friday' },
    { date: new Date('2026-04-14'), name: 'Tamil New Year / Ambedkar Jayanti' },
    { date: new Date('2026-05-01'), name: 'May Day' },
    { date: new Date('2026-05-28'), name: 'Bakrid (Id-ul-Zuha)' },
    { date: new Date('2026-06-26'), name: 'Muharram' },
    { date: new Date('2026-08-15'), name: 'Independence Day' },
    { date: new Date('2026-08-26'), name: 'Milad-un-Nabi' },
    { date: new Date('2026-09-04'), name: 'Krishna Jayanti' },
    { date: new Date('2026-09-14'), name: 'Vinayakar Chaturthi' },
    { date: new Date('2026-10-02'), name: 'Gandhi Jayanti' },
    { date: new Date('2026-10-19'), name: 'Aayudha Poojai' },
    { date: new Date('2026-10-20'), name: 'Saraswathi Poojai' },
    { date: new Date('2026-11-08'), name: 'Deepavali' },
    { date: new Date('2026-12-25'), name: 'Christmas' }
];

export function getHoliday(date: Date): Holiday | undefined {
    return TN_HOLIDAYS_2026.find(h => isSameDay(h.date, date));
}
