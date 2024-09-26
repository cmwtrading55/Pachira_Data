// src/utils/DataFetcher.js
import axios from 'axios';

// Function to fetch data from Google Sheets
export const fetchDataFromSheet = async (sheetId, apiKey, tabNames) => {
  try {
    const tabDataPromises = tabNames.map((tab) => {
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${tab}?key=${apiKey}`;
      console.log(`Fetching data for ${tab} from URL: ${apiUrl}`);
      return axios.get(apiUrl)
        .then(response => ({ tabName: tab, data: response.data }))
        .catch(error => {
          console.error(`Error fetching data for ${tab}:`, error);
          return { tabName: tab, data: null, error };
        });
    });

    const tabDataResults = await Promise.all(tabDataPromises);
    return tabDataResults;
  } catch (error) {
    throw new Error('Error fetching data from Google Sheets');
  }
};
