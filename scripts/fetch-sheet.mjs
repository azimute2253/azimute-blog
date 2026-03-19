import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const SHEET_ID = '1HG6pQdx-P85vd8EVg7bDzI2X-yW4bAF1HQVbXIaes0g';
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS ||
  `${process.env.HOME}/.openclaw/credentials/gog-credentials.json`;
const TOKEN_PATH = `${process.env.HOME}/.openclaw/credentials/gog-token.json`;

async function getAuthClient() {
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have a token already
  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Need to get new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);

  return oAuth2Client;
}

async function fetchSheet() {
  // Authenticate
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  // Get spreadsheet metadata (all tabs)
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  console.log('Sheet Title:', metadata.data.properties.title);
  console.log('Tabs:', metadata.data.sheets.map(s => s.properties.title));

  // Fetch data from all tabs
  const allData = {};
  for (const sheet of metadata.data.sheets) {
    const sheetName = sheet.properties.title;
    const range = `${sheetName}!A1:Z1000`; // Adjust range as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });

    allData[sheetName] = response.data.values;
    console.log(`${sheetName}: ${response.data.values?.length || 0} rows`);
  }

  return { metadata: metadata.data, data: allData };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchSheet()
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(err => console.error('Error:', err.message));
}

export { fetchSheet };
