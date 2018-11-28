const xlsx = require('xlsx');

let workbook = xlsx.readFile('data.xlsx');

xlsx.utils.sheet_to_json(workbook.Sheets["Decision Data"])