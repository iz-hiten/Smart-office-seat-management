import { format, differenceInDays, startOfWeek, addDays, isWeekend, getHours } from 'date-fns';
import { ROTATION_START_DATE } from '../constants';
import { Batch } from '../types';

export function getWeekCycle(date: Date): number {
  const start = new Date(ROTATION_START_DATE);
  const diffDays = differenceInDays(date, start);
  const weeksSinceStart = Math.floor(diffDays / 7);
  return Math.abs(weeksSinceStart % 2); // 0 or 1
}

export function isDesignatedDay(date: Date, batch: Batch): boolean {
  if (isWeekend(date)) return false;
  
  const cycle = getWeekCycle(date);
  const day = date.getDay(); // 1 (Mon) to 5 (Fri)

  if (batch === 1) {
    if (cycle === 0) return day >= 1 && day <= 3; // Mon-Wed
    return day >= 4 && day <= 5; // Thu-Fri
  } else {
    if (cycle === 0) return day >= 4 && day <= 5; // Thu-Fri
    return day >= 1 && day <= 3; // Mon-Wed
  }
}

export function canBookNextDay(currentDate: Date): boolean {
  const hour = getHours(currentDate);
  return hour >= 15; // 3 PM
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getNext7Days(): Date[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    days.push(addDays(today, i));
  }
  return days;
}
