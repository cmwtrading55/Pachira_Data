// src/components/GoogleSheetData.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import SummaryTable from './SummaryTable';
import { fetchDataFromSheet } from '../utils/DataFetcher';
import { calculateWeeklySummary, calculateAllSummary } from '../utils/Calculations';
import './GoogleSheetData.css';

const GoogleSheetData = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [weeklySummaryData, setWeeklySummaryData] = useState([]);
  const [allSummaryData, setAllSummaryData] = useState([]);
  const [dailyPachiraData, setDailyPachiraData] = useState([]);
  const [weeklyPachiraData, setWeeklyPachiraData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });
  const [view, setView] = useState('daily');
  const sheetId = process.env.REACT_APP_SHEET_ID;
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;



  // Memoize the tabNames array to prevent re-creation on each render
  const tabNames = useMemo(() => ['S1x', 'S2x', 'S3PM', 'S3IR', 'follow', 'Tennis', 'MLB', 'American Football'], []);

  // Define the tab names to be used in the Pachira views
  const pachiraTabNames = useMemo(() => ['follow', 'Tennis', 'MLB', 'American Football'], []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log('Fetching data for all tabs...');

        // Fetch data from all tabs
        const tabDataResults = await fetchDataFromSheet(sheetId, apiKey, tabNames);
        console.log('Tab data results:', tabDataResults);

        // Combine all data into a summary object
        const summary = {};
        const dailyPachiraSummary = {};

        tabDataResults.forEach(({ tabName, data, error }) => {
          if (data === null) {
            console.error(`No data received for ${tabName}. Error:`, error?.response ? error.response.data : error.message);
            return;
          }

          const tabData = data.values || [];
          console.log(`Processing data for ${tabName}`, tabData.slice(0, 5)); // Log first 5 rows

          if (tabData.length < 2) {
            console.warn(`No data found in tab ${tabName}`);
          } else {
            console.log(`Total rows in ${tabName}:`, tabData.length);
          }

          // Skip the header row and process each row
          tabData.slice(1).forEach((row, rowIndex) => {
            const date = row[0]; // Date column

            // Use column K (index 10) for income in Tennis, MLB, and American Football tabs; column I (index 8) for other tabs
            const incomeColumnIndex = ['Tennis', 'MLB', 'American Football'].includes(tabName) ? 10 : 8;

            // Specific column handling for Turnover:
            // - Column E (index 4) for Tennis
            // - Column F (index 5) for American Football, MLB, and other tabs
            const turnoverColumnIndex = tabName === 'Tennis' ? 4 : 5;

            // Check if income and turnover columns exist and have valid numbers
            if (row[incomeColumnIndex] !== undefined && row[turnoverColumnIndex] !== undefined) {
              const incomeRaw = row[incomeColumnIndex].replace(/,/g, '').trim();
              const turnoverRaw = row[turnoverColumnIndex].replace(/,/g, '').trim();
              const income = parseFloat(incomeRaw);
              const turnover = parseFloat(turnoverRaw);

              // Log values to ensure they're being parsed correctly
              console.log(`Processing row ${rowIndex + 1} for ${tabName} on ${date}: Income = ${income}, Turnover = ${turnover}`);

              if (!isNaN(income) && !isNaN(turnover)) {
                // Update the summary object
                if (!summary[date]) {
                  summary[date] = { date, TotalTurnover: 0, Total: 0 }; // Initialize with Total and TotalTurnover
                }
                summary[date][tabName] = (summary[date][tabName] || 0) + income;
                summary[date][`turnover_${tabName}`] = (summary[date][`turnover_${tabName}`] || 0) + turnover;

                // Update TotalTurnover and Total for the full summary
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
              } else {
                console.warn(`Invalid income or turnover value at row ${rowIndex + 1} for ${tabName} on ${date}:`, row[incomeColumnIndex], row[turnoverColumnIndex]);
              }
            } else {
              console.warn(`Missing income or turnover value at row ${rowIndex + 1} for ${tabName} on ${date}`);
            }
          });
        });

        // Convert summary and dailyPachiraSummary objects to arrays
        const summaryArray = Object.values(summary);
        const dailyPachiraArray = Object.values(dailyPachiraSummary);

        console.log('Final Summary Data:', summaryArray);
        console.log('Final Daily Pachira Data:', dailyPachiraArray);

        // Calculate weekly summaries
        const weeklyPachiraArray = calculateWeeklySummary(dailyPachiraArray, pachiraTabNames);

        setSummaryData(summaryArray);
        setWeeklySummaryData(calculateWeeklySummary(summaryArray, tabNames));
        setAllSummaryData(calculateAllSummary(summaryArray, tabNames));
        setDailyPachiraData(dailyPachiraArray);
        setWeeklyPachiraData(weeklyPachiraArray);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [apiKey, sheetId, tabNames, pachiraTabNames]);

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const dataToSort =
      view === 'daily' ? summaryData :
      view === 'weekly' ? weeklySummaryData :
      view === 'all' ? allSummaryData :
      view === 'dailyPachira' ? dailyPachiraData :
      view === 'weeklyPachira' ? weeklyPachiraData : [];

    const sortedData = [...dataToSort].sort((a, b) => {
      if (key === 'date' || key === 'weekStart') {
        return direction === 'ascending'
          ? new Date(a[key].split('/').reverse().join('-')) - new Date(b[key].split('/').reverse().join('-'))
          : new Date(b[key].split('/').reverse().join('-')) - new Date(a[key].split('/').reverse().join('-'));
      } else {
        const aValue = a[key] !== undefined ? a[key] : 0;
        const bValue = b[key] !== undefined ? b[key] : 0;
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
    });

        if (view === 'daily') {
      setSummaryData(sortedData);
    } else if (view === 'weekly') {
      setWeeklySummaryData(sortedData);
    } else if (view === 'all') {
      setAllSummaryData(sortedData);
    } else if (view === 'dailyPachira') {
      setDailyPachiraData(sortedData);
    } else if (view === 'weeklyPachira') {
      setWeeklyPachiraData(sortedData);
    }

    setSortConfig({ key, direction });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Performance Summary</h1>
      <div>
        <button onClick={() => setView('daily')}>Daily Summary</button>
        <button onClick={() => setView('weekly')}>Weekly Summary</button>
        <button onClick={() => setView('all')}>All Summary</button>
        <button onClick={() => setView('dailyPachira')}>Daily Pachira Income</button>
        <button onClick={() => setView('weeklyPachira')}>Weekly Pachira Income</button>
      </div>
      {view === 'daily' ? (
        <>
          <h2>Daily Summary</h2>
          <SummaryTable
            data={summaryData}
            sortConfig={sortConfig}
            sortData={sortData}
            tabNames={tabNames}
            isWeekly={false}
            isAllSummary={false}
          />
        </>
      ) : view === 'weekly' ? (
        <>
          <h2>Weekly Summary</h2>
          <SummaryTable
            data={weeklySummaryData}
            sortConfig={sortConfig}
            sortData={sortData}
            tabNames={tabNames}
            isWeekly={true}
            isAllSummary={false}
          />
        </>
      ) : view === 'all' ? (
        <>
          <h2>All Summary</h2>
          <SummaryTable
            data={allSummaryData}
            sortConfig={sortConfig}
            sortData={sortData}
            tabNames={tabNames}
            isWeekly={false}
            isAllSummary={true}
          />
        </>
      ) : view === 'dailyPachira' ? (
        <>
          <h2>Daily Pachira Income</h2>
          <SummaryTable
            data={dailyPachiraData}
            sortConfig={sortConfig}
            sortData={sortData}
            tabNames={pachiraTabNames}
            isWeekly={false}
            isAllSummary={false}
          />
        </>
      ) : view === 'weeklyPachira' ? (
        <>
          <h2>Weekly Pachira Income</h2>
          <SummaryTable
            data={weeklyPachiraData}
            sortConfig={sortConfig}
            sortData={sortData}
            tabNames={pachiraTabNames}
            isWeekly={true}
            isAllSummary={false}
          />
        </>
      ) : null}
    </div>
  );
};

export default GoogleSheetData;
