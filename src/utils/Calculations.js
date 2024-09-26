// src/utils/Calculations.js

// Function to calculate weekly summary
export const calculateWeeklySummary = (dailyData, tabNames) => {
  const weeklySummary = {};

  dailyData.forEach(row => {
    const dateParts = row.date.split('/');
    const [day, month, year] = dateParts.map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekStart = new Date(dateObj.setDate(dateObj.getDate() - dateObj.getDay() + 1));
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklySummary[weekKey]) {
      weeklySummary[weekKey] = { weekStart: weekKey };
    }

    tabNames.forEach(tab => {
      weeklySummary[weekKey][tab] = (weeklySummary[weekKey][tab] || 0) + (row[tab] || 0);
    });

    weeklySummary[weekKey].Total = (weeklySummary[weekKey].Total || 0) + row.Total;
  });

  return Object.values(weeklySummary);
};

// Function to calculate all summary
export const calculateAllSummary = (dailyData, tabNames) => {
  const totalSummary = {};

  dailyData.forEach(row => {
    tabNames.forEach(tab => {
      totalSummary[tab] = totalSummary[tab] || { totalPL: 0, totalTurnover: 0, roi: 0 };
      totalSummary[tab].totalPL += row[tab] || 0;
      totalSummary[tab].totalTurnover += row[`turnover_${tab}`] || 0;
    });
  });

  // Calculate ROI and add to summary data
  return Object.entries(totalSummary).map(([tab, totals]) => {
    const roi = totals.totalTurnover !== 0 ? (totals.totalPL / totals.totalTurnover) * 100 : 0;
    return {
      tabName: tab,
      totalPL: totals.totalPL,
      totalTurnover: totals.totalTurnover,
      roi
    };
  });
};

// Function to calculate total row for All Summary
export const calculateTotalRow = (allSummaryData) => {
  const totalPL = allSummaryData.reduce((sum, row) => sum + row.totalPL, 0);
  const totalTurnover = allSummaryData.reduce((sum, row) => sum + row.totalTurnover, 0);
  const roi = totalTurnover !== 0 ? (totalPL / totalTurnover) * 100 : 0;

  return {
    tabName: 'Total',
    totalPL,
    totalTurnover,
    roi
  };
};
