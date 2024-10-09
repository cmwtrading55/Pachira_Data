// src/utils/SummaryDataFetcher.js
import { fetchDataFromSheet } from './DataFetcher';
import { calculateWeeklySummary, calculateAllSummary } from './Calculations';

export const fetchSummaryData = async (sheetId, apiKey, tabNames, pachiraTabNames) => {
  try {
    const tabDataResults = await fetchDataFromSheet(sheetId, apiKey, tabNames);

    if (!tabDataResults || tabDataResults.length === 0) {
      throw new Error('No data returned from the sheet.');
    }

    const summary = {};
    const dailyPachiraSummary = {};

    tabDataResults.forEach(({ tabName, data }) => {
      const tabData = data.values || [];
      tabData.slice(1).forEach((row) => {
        const date = row[0];

        const incomeColumnIndex = ['Tennis', 'MLB', 'American Football'].includes(tabName) ? 10 : 8;
        const turnoverColumnIndex = tabName === 'Tennis' ? 4 : 5;

        const incomeRaw = row[incomeColumnIndex]?.replace(/,/g, '').trim();
        const turnoverRaw = row[turnoverColumnIndex]?.replace(/,/g, '').trim();
        const income = parseFloat(incomeRaw);
        const turnover = parseFloat(turnoverRaw);

        if (!isNaN(income) && !isNaN(turnover)) {
          if (!summary[date]) {
            summary[date] = { date, TotalTurnover: 0, Total: 0 };
          }
          summary[date][tabName] = (summary[date][tabName] || 0) + income;
          summary[date][`turnover_${tabName}`] = (summary[date][`turnover_${tabName}`] || 0) + turnover;

          summary[date].TotalTurnover += turnover;
          summary[date].Total += income;

          // For Pachira Summary
          if (pachiraTabNames.includes(tabName)) {
            if (!dailyPachiraSummary[date]) {
              dailyPachiraSummary[date] = { date, Total: 0 };
            }
            dailyPachiraSummary[date][tabName] = (dailyPachiraSummary[date][tabName] || 0) + income;
            dailyPachiraSummary[date].Total += income;
          }
        }
      });
    });

    const summaryArray = Object.values(summary);
    const dailyPachiraArray = Object.values(dailyPachiraSummary);

    // Calculate weekly and overall summaries
    const weeklyPachiraArray = calculateWeeklySummary(dailyPachiraArray, pachiraTabNames);
    const weeklySummaryData = calculateWeeklySummary(summaryArray, tabNames);
    const allSummaryData = calculateAllSummary(summaryArray, tabNames);

    return {
      summaryData: summaryArray,
      weeklySummaryData,
      allSummaryData,
      dailyPachiraData: dailyPachiraArray,
      weeklyPachiraData: weeklyPachiraArray,
    };
  } catch (error) {
    console.error('Error fetching summary data:', error);
    throw error;
  }
};
