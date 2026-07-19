import {
  endOfMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const TIMEZONE = "America/Sao_Paulo";

export interface AdMobDate {
  year: number;
  month: number;
  day: number;
}

export interface DateRange {
  startDate: AdMobDate;
  endDate: AdMobDate;
}

function toAdMobDate(date: Date): AdMobDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function nowInTimezone(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function getTodayRange(): DateRange {
  const today = nowInTimezone();
  const date = toAdMobDate(today);
  return { startDate: date, endDate: date };
}

export function getYesterdayRange(): DateRange {
  const yesterday = subDays(nowInTimezone(), 1);
  const date = toAdMobDate(yesterday);
  return { startDate: date, endDate: date };
}

export function getCurrentMonthRange(): DateRange {
  const now = nowInTimezone();
  return {
    startDate: toAdMobDate(startOfMonth(now)),
    endDate: toAdMobDate(now),
  };
}

export function getLastMonthRange(): DateRange {
  const lastMonth = subMonths(nowInTimezone(), 1);
  return {
    startDate: toAdMobDate(startOfMonth(lastMonth)),
    endDate: toAdMobDate(endOfMonth(lastMonth)),
  };
}
