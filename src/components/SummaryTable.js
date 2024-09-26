// src/components/SummaryTable.js
import React from 'react';
import './SummaryTable.css'; // Optional: Add your styles here

const SummaryTable = ({ data, sortConfig, sortData, isWeekly, isAllSummary, isIncome, tabNames }) => {
  // Function to format numbers with commas
  const formatNumber = (num) => {
    if (num !== null && !isNaN(num)) {
      return num.toLocaleString(); // Adds commas to the number
    }
    return '-';
  };

  // Calculate the total row for the All Summary view
  const calculateTotalRow = () => {
    const totalPL = data.reduce((sum, row) => sum + row.totalPL, 0);
    const totalTurnover = data.reduce((sum, row) => sum + row.totalTurnover, 0);
    const roi = totalTurnover !== 0 ? (totalPL / totalTurnover) * 100 : 0;

    return {
      tabName: 'Total',
      totalPL,
      totalTurnover,
      roi
    };
  };

  const totalRow = isAllSummary ? calculateTotalRow() : null;

  return (
    <table border="1">
      <thead>
        <tr>
          {isIncome ? (
            <>
              <th onClick={() => sortData(isWeekly ? 'weekStart' : 'date')}>
                {isWeekly ? 'Week Starting' : 'Date'} {sortConfig.key === (isWeekly ? 'weekStart' : 'date') ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => sortData('income')}>
                Income {sortConfig.key === 'income' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
            </>
          ) : isAllSummary ? (
            <>
              <th onClick={() => sortData('tabName')}>
                Tab {sortConfig.key === 'tabName' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => sortData('totalPL')}>
                Total P/L {sortConfig.key === 'totalPL' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => sortData('totalTurnover')}>
                Total Turnover {sortConfig.key === 'totalTurnover' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              <th onClick={() => sortData('roi')}>
                ROI (%) {sortConfig.key === 'roi' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
            </>
          ) : (
            <>
              <th onClick={() => sortData(isWeekly ? 'weekStart' : 'date')}>
                {isWeekly ? 'Week Starting' : 'Date'} {sortConfig.key === (isWeekly ? 'weekStart' : 'date') ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
              {tabNames.map((tab, index) => (
                <th key={index} onClick={() => sortData(tab)}>
                  {tab} {sortConfig.key === tab ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th onClick={() => sortData('Total')}>
                Total {sortConfig.key === 'Total' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {isIncome ? (
              <>
                <td>{isWeekly ? row.weekStart : row.date}</td>
                <td>{formatNumber(Math.round(row.income))}</td>
              </>
            ) : isAllSummary ? (
              <>
                <td>{row.tabName}</td>
                <td className={row.totalPL > 0 ? 'positive' : row.totalPL < 0 ? 'negative' : ''}>
                  {formatNumber(Math.round(row.totalPL))}
                </td>
                <td>{formatNumber(Math.round(row.totalTurnover))}</td>
                <td className={row.roi > 0 ? 'positive' : row.roi < 0 ? 'negative' : ''}>
                  {row.roi.toFixed(2)}%
                </td>
              </>
            ) : (
              <>
                <td>{isWeekly ? row.weekStart : row.date}</td>
                {tabNames.map((tab, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={row[tab] > 0 ? 'positive' : row[tab] < 0 ? 'negative' : ''}
                  >
                    {row[tab] !== undefined ? formatNumber(Math.round(row[tab])) : '-'}
                  </td>
                ))}
                <td className={row.Total > 0 ? 'positive' : row.Total < 0 ? 'negative' : ''}>
                  {formatNumber(Math.round(row.Total))}
                </td>
              </>
            )}
          </tr>
        ))}
        {isAllSummary && (
          <tr>
            <td><strong>{totalRow.tabName}</strong></td>
            <td className={totalRow.totalPL > 0 ? 'positive' : totalRow.totalPL < 0 ? 'negative' : ''}>
              <strong>{formatNumber(Math.round(totalRow.totalPL))}</strong>
            </td>
            <td><strong>{formatNumber(Math.round(totalRow.totalTurnover))}</strong></td>
            <td className={totalRow.roi > 0 ? 'positive' : totalRow.roi < 0 ? 'negative' : ''}>
              <strong>{totalRow.roi.toFixed(2)}%</strong>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default SummaryTable;
