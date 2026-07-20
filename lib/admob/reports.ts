import { microsToAmount } from "@/lib/format";
import { getAdMobClient, getPublisherId } from "./client";
import {
  getCurrentMonthRange,
  getDayBeforeYesterdayRange,
  getLastMonthRange,
  getLastMonthSamePeriodRange,
  getMonthBeforeLastRange,
  getTodayRange,
  getYesterdayRange,
  type DateRange,
} from "./dates";

interface ReportRow {
  dimensionValues?: Record<string, { value?: string; displayLabel?: string }>;
  metricValues?: Record<
    string,
    { microsValue?: string; integerValue?: string }
  >;
}

interface MediationReportResponse {
  header?: unknown;
  row?: ReportRow;
  footer?: unknown;
}

export interface AppEarning {
  appId: string;
  appName: string;
  platform: string;
  amount: number;
}

export interface EarningsSummary {
  today: number;
  yesterday: number;
  dayBeforeYesterday: number;
  currentMonth: number;
  lastMonth: number;
  lastMonthSamePeriod: number;
  monthBeforeLast: number;
  currentMonthByApp: AppEarning[];
  updatedAt: string;
}

async function generateReport(
  dateRange: DateRange,
  dimensions: string[] = [],
): Promise<MediationReportResponse[]> {
  const admob = getAdMobClient();
  const publisherId = getPublisherId();

  const response = await admob.accounts.mediationReport.generate({
    parent: `accounts/${publisherId}`,
    requestBody: {
      reportSpec: {
        dateRange,
        dimensions,
        metrics: ["ESTIMATED_EARNINGS"],
        localizationSettings: {
          currencyCode: "BRL",
          languageCode: "pt-BR",
        },
      },
    },
  });

  return (response.data as MediationReportResponse[]) ?? [];
}

function sumEarningsFromReport(rows: MediationReportResponse[]): number {
  return rows.reduce((total, item) => {
    const micros = item.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue;
    if (!micros) {
      return total;
    }
    return total + microsToAmount(micros);
  }, 0);
}

function parseAppEarnings(rows: MediationReportResponse[]): AppEarning[] {
  return rows
    .filter((item) => item.row)
    .map((item) => {
      const app = item.row?.dimensionValues?.APP;
      const platform = item.row?.dimensionValues?.PLATFORM;
      const micros =
        item.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue ?? "0";
      return {
        appId: app?.value ?? "unknown",
        appName: app?.displayLabel ?? app?.value ?? "App desconhecido",
        platform: platform?.displayLabel ?? platform?.value ?? "Desconhecido",
        amount: microsToAmount(micros),
      };
    })
    .filter((app) => app.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export async function getEarningsSummary(): Promise<EarningsSummary> {
  const [
    todayRows,
    yesterdayRows,
    dayBeforeYesterdayRows,
    currentMonthRows,
    lastMonthRows,
    lastMonthSamePeriodRows,
    monthBeforeLastRows,
    byAppRows,
  ] = await Promise.all([
    generateReport(getTodayRange()),
    generateReport(getYesterdayRange()),
    generateReport(getDayBeforeYesterdayRange()),
    generateReport(getCurrentMonthRange()),
    generateReport(getLastMonthRange()),
    generateReport(getLastMonthSamePeriodRange()),
    generateReport(getMonthBeforeLastRange()),
    generateReport(getCurrentMonthRange(), ["APP", "PLATFORM"]),
  ]);

  return {
    today: sumEarningsFromReport(todayRows),
    yesterday: sumEarningsFromReport(yesterdayRows),
    dayBeforeYesterday: sumEarningsFromReport(dayBeforeYesterdayRows),
    currentMonth: sumEarningsFromReport(currentMonthRows),
    lastMonth: sumEarningsFromReport(lastMonthRows),
    lastMonthSamePeriod: sumEarningsFromReport(lastMonthSamePeriodRows),
    monthBeforeLast: sumEarningsFromReport(monthBeforeLastRows),
    currentMonthByApp: parseAppEarnings(byAppRows),
    updatedAt: new Date().toISOString(),
  };
}
