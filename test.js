const xlsx = require('xlsx');

let workbook = xlsx.utils.book_new();
let sheet1 = xlsx.utils.json_to_sheet([{"hello": "world"}]);
xlsx.utils.book_append_sheet(workbook, sheet1, "Sheet1");
xlsx.writeFile(workbook, "text.xlsx");