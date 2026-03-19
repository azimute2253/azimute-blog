import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const workbook = XLSX.readFile('data/portfolio.xlsx');
const sheetNames = workbook.SheetNames;

const analysis = {};

console.log('=== PORTFOLIO SPREADSHEET DEEP ANALYSIS ===\n');
console.log('Total tabs:', sheetNames.length);
console.log('Tab names:', JSON.stringify(sheetNames, null, 2));
console.log('\n');

sheetNames.forEach(name => {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

  // Collect all formulas
  const formulas = [];
  const merges = sheet['!merges'] || [];
  const cellTypes = {};

  Object.keys(sheet).forEach(key => {
    if (key.startsWith('!')) return;
    const cell = sheet[key];

    // Track cell types
    const type = cell.t; // s=string, n=number, b=boolean, d=date, e=error
    cellTypes[type] = (cellTypes[type] || 0) + 1;

    if (cell.f) {
      formulas.push({
        cell: key,
        formula: cell.f,
        value: cell.v,
        type: cell.t
      });
    }
  });

  // Detect column headers (first non-empty row)
  let headerRow = 0;
  for (let i = 0; i < Math.min(data.length, 5); i++) {
    if (data[i] && data[i].some(c => c !== '')) {
      headerRow = i;
      break;
    }
  }

  const headers = data[headerRow] || [];

  // Detect data patterns per column
  const columnAnalysis = headers.map((header, colIdx) => {
    const values = data.slice(headerRow + 1).map(row => row[colIdx]).filter(v => v !== '' && v !== undefined);
    const numericValues = values.filter(v => typeof v === 'number');
    const stringValues = values.filter(v => typeof v === 'string');

    return {
      header: header || `(col ${colIdx})`,
      totalValues: values.length,
      numericCount: numericValues.length,
      stringCount: stringValues.length,
      sampleValues: values.slice(0, 5),
      isPercentage: numericValues.length > 0 && numericValues.every(v => v >= -1 && v <= 1),
      isCurrency: numericValues.length > 0 && numericValues.some(v => v > 1 && v < 1000000),
    };
  });

  // Group formulas by pattern
  const formulaPatterns = {};
  formulas.forEach(f => {
    // Normalize formula: replace cell refs with placeholders
    const pattern = f.formula.replace(/[A-Z]+\d+/g, 'REF');
    if (!formulaPatterns[pattern]) {
      formulaPatterns[pattern] = [];
    }
    formulaPatterns[pattern].push({ cell: f.cell, formula: f.formula, value: f.value });
  });

  const tabAnalysis = {
    name,
    dimensions: {
      rows: range.e.r - range.s.r + 1,
      cols: range.e.c - range.s.c + 1,
      totalCells: Object.keys(sheet).filter(k => !k.startsWith('!')).length
    },
    headerRow,
    headers: headers.filter(h => h !== ''),
    merges: merges.map(m => ({
      range: XLSX.utils.encode_range(m),
      startCell: XLSX.utils.encode_cell(m.s),
      endCell: XLSX.utils.encode_cell(m.e)
    })),
    cellTypeDistribution: cellTypes,
    formulaCount: formulas.length,
    formulas: formulas.slice(0, 100), // First 100 formulas
    formulaPatterns: Object.entries(formulaPatterns).map(([pattern, instances]) => ({
      pattern,
      count: instances.length,
      examples: instances.slice(0, 3)
    })),
    columnAnalysis,
    sampleData: data.slice(0, Math.min(data.length, 30)),
    totalRows: data.length
  };

  analysis[name] = tabAnalysis;

  // Console output
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TAB: "${name}"`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Dimensions: ${tabAnalysis.dimensions.rows} rows × ${tabAnalysis.dimensions.cols} cols`);
  console.log(`Total cells with data: ${tabAnalysis.dimensions.totalCells}`);
  console.log(`Cell types:`, cellTypes);
  console.log(`Header row index: ${headerRow}`);
  console.log(`Headers:`, headers.filter(h => h !== ''));
  console.log(`Merges:`, tabAnalysis.merges.length);
  if (tabAnalysis.merges.length > 0) {
    tabAnalysis.merges.forEach(m => console.log(`  ${m.range}`));
  }

  console.log(`\nFormulas (${formulas.length} total):`);
  formulas.forEach(f => {
    console.log(`  ${f.cell}: =${f.formula} → ${f.value}`);
  });

  console.log('\nColumn Analysis:');
  columnAnalysis.forEach(col => {
    if (col.header && col.totalValues > 0) {
      console.log(`  ${col.header}: ${col.totalValues} values (${col.numericCount} numeric, ${col.stringCount} string)`);
      console.log(`    Samples: ${JSON.stringify(col.sampleValues.slice(0, 3))}`);
    }
  });

  console.log('\nAll Data Rows:');
  data.forEach((row, i) => {
    const nonEmpty = row.filter(c => c !== '');
    if (nonEmpty.length > 0) {
      console.log(`  [${i}]: ${JSON.stringify(row)}`);
    }
  });
});

// Write full analysis to JSON for reference
writeFileSync('data/portfolio-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n\nFull analysis written to data/portfolio-analysis.json');
