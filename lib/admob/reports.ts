import { unstable_cache } from "next/cache";
import { microsToAmount } from "@/lib/format";
import { getAdMobClient, getPublisherId } from "./client";
import {
  getCurrentMonthRange,
  getLastMonthRange,
  getTodayRange,
  getYesterdayRange,
  type DateRange,
} from "./dates";

interface ReportRow {
  dimensionValues?: Record<
    string,
    { value?: string; displayLabel?: string }
  >;
  metricValues?: Record<string, { microsValue?: string; integerValue?: string }>;
}

interface NetworkReportResponse {
  header?: unknown;
  row?: ReportRow;
  footer?: unknown;
}

export interface AppEarning {
  appId: string;
  appName: string;
  amount: number;
}

export interface EarningsSummary {
  today: number;
  yesterday: number;
  currentMonth: number;
  lastMonth: number;
  currentMonthByApp: AppEarning[];
  updatedAt: string;
}

async function generateReport(
  dateRange: DateRange,
  dimensions: string[] = [],
): Promise<NetworkReportResponse[]> {
  const admob = getAdMobClient();
  const publisherId = getPublisherId();

  const response = await admob.accounts.networkReport.generate({
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

  return (response.data as NetworkReportResponse[]) ?? [];
}

function sumEarningsFromReport(rows: NetworkReportResponse[]): number {
  return rows.reduce((total, item) => {
    const micros = item.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue;
    if (!micros) {
      return total;
    }
    return total + microsToAmount(micros);
  }, 0);
}

function parseAppEarnings(rows: NetworkReportResponse[]): AppEarning[] {
  return rows
    .filter((item) => item.row)
    .map((item) => {
      const app = item.row?.dimensionValues?.APP;
      const micros = item.row?.metricValues?.ESTIMATED_EARNINGS?.microsValue ?? "0";
      return {
        appId: app?.value ?? "unknown",
        appName: app?.displayLabel ?? app?.value ?? "App desconhecido",
        amount: microsToAmount(micros),
      };
    })
    .filter((app) => app.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

async function fetchEarningsSummary(): Promise<EarningsSummary> {
  const [todayRows, yesterdayRows, currentMonthRows, lastMonthRows, byAppRows] =
    await Promise.all([
      generateReport(getTodayRange()),
      generateReport(getYesterdayRange()),
      generateReport(getCurrentMonthRange()),
      generateReport(getLastMonthRange()),
      generateReport(getCurrentMonthRange(), ["APP"]),
    ]);

  return {
    today: sumEarningsFromReport(todayRows),
    yesterday: sumEarningsFromReport(yesterdayRows),
    currentMonth: sumEarningsFromReport(currentMonthRows),
    lastMonth: sumEarningsFromReport(lastMonthRows),
    currentMonthByApp: parseAppEarnings(byAppRows),
    updatedAt: new Date().toISOString(),
  };
}

export const getCachedEarningsSummary = unstable_cache(
  fetchEarningsSummary,
  ["admob-earnings-summary"],
  { revalidate: 900 },
);
