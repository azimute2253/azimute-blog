import { google } from 'googleapis';
import { readFileSync, writeFileSync } from 'fs';

const SHEET_ID = '1HG6pQdx-P85vd8EVg7bDzI2X-yW4bAF1HQVbXIaes0g';
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS ||
  `${process.env.HOME}/.openclaw/credentials/gog-credentials.json`;

async function fetchSheetWithServiceAccount() {
  try {
    // Try to use credentials directly with JWT auth
    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));

    // Check if it's a service account or OAuth client
    if (credentials.type === 'service_account') {
      // Service account flow
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });

      return await fetchSheetData(sheets);
    } else {
      // OAuth client flow - this is what we have
      console.log('OAuth client credentials detected - requires interactive auth');
      console.log('Please run the sheet fetch manually or set up service account');

      // For now, let's try to use a public API key approach or return mock structure
      return {
        error: 'OAuth required',
        message: 'This script requires interactive OAuth authentication. Please run: node scripts/fetch-sheet.mjs'
      };
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function fetchSheetData(sheets) {
  // Get spreadsheet metadata
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  console.error('Sheet Title:', metadata.data.properties.title);
  console.error('Tabs:', metadata.data.sheets.map(s => s.properties.title).join(', '));

  // Fetch data from all tabs
  const allData = {};
  for (const sheet of metadata.data.sheets) {
    const sheetName = sheet.properties.title;
    const range = `${sheetName}!A1:Z1000`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    allData[sheetName] = response.data.values;
    console.error(`${sheetName}: ${response.data.values?.length || 0} rows`);
  }

  return {
    sheetId: SHEET_ID,
    title: metadata.data.properties.title,
    metadata: metadata.data,
    tabs: allData
  };
}

// Run
fetchSheetWithServiceAccount()
  .then(result => {
    // Write to data directory
    writeFileSync('data/sheet-data.json', JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
