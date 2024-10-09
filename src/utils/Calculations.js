// src/utils/Calculations.js

// Function to calculate weekly summary with Monday as the start of the week and label in dd/mm/yyyy format
export const calculateWeeklySummary = (dailyData, tabNames) => {
  const weeklySummary = {};

  dailyData.forEach(row => {
    const dateParts = row.date.split('/');
    const [day, month, year] = dateParts.map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Adjust for week starting on Monday (ISO week)
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // Monday becomes 0, Sunday becomes 6
    const weekStart = new Date(dateObj);
    weekStart.setDate(dateObj.getDate() - dayOfWeek); // Set to the previous Monday

    // Convert weekStart to dd/mm/yyyy format for labels
    const weekLabel = `${('0' + weekStart.getDate()).slice(-2)}/${('0' + (weekStart.getMonth() + 1)).slice(-2)}/${weekStart.getFullYear()}`;

    if (!weeklySummary[weekLabel]) {
      weeklySummary[weekLabel] = { weekStart: weekLabel }; // Label in dd/mm/yyyy format
    }

    tabNames.forEach(tab => {
      weeklySummary[weekLabel][tab] = (weeklySummary[weekLabel][tab] || 0) + (row[tab] || 0);
    });

    weeklySummary[weekLabel].Total = (weeklySummary[weekLabel].Total || 0) + row.Total;
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
