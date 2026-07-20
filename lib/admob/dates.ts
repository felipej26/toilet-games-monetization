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

export function getDayBeforeYesterdayRange(): DateRange {
  const day = subDays(nowInTimezone(), 2);
  const date = toAdMobDate(day);
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

export function getLastMonthSamePeriodRange(): DateRange {
  const now = nowInTimezone();
  const end = subMonths(now, 1);
  return {
    startDate: toAdMobDate(startOfMonth(end)),
    endDate: toAdMobDate(end),
  };
}

export function getMonthBeforeLastRange(): DateRange {
  const month = subMonths(nowInTimezone(), 2);
  return {
    startDate: toAdMobDate(startOfMonth(month)),
    endDate: toAdMobDate(endOfMonth(month)),
  };
}
