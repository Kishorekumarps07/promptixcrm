export function getWorkingDaysInMonth(month: number, year: number): number {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last date of month

    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const day = currentDate.getDay();
        // 0 = Sunday, 6 = Saturday
        if (day !== 0 && day !== 6) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
}
