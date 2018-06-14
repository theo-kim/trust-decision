let express = require('express');
let router = express.Router();
let mturk = require('mturk-api');
let xml = require("xml-parse");
let db = require('../db.js');
let moment = require('moment');
let json2csv = require('json2csv');

let emails = require('../data/emails.json')

let userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
let testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
let roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';

const scenarioRef = ['Apple', 'Student'];
const selectionRef = ['phishing', 'normal'];

function fetchRounds (index, tests) {
	return new Promise(function (resolve, reject) {
		// Base case
		if (index >= tests.length) {
			resolve();
		}

		else {
			let columnLabels = {}, output = tests[index];

			// Fetch all rounds associated with the test
			db.select().from(roundTable).where('testid', tests[index].id)
				.then(function (rounds) {
					// Iterate through each round and add its heading to the columnLabels
					for (let i = 0; i < rounds.length; ++i) {
						const round = rounds[i],
							columns = Object.keys(round),
							prefix = 'round_' + (i + 1) + '_';
						
						// Iterate through each column
						for (let j = 0; j < columns.length; ++j) {
							let column = columns[j];

							// Check for specific column and do specific things
							if (column == 'start') {
								let s = moment(round.start),
									e = moment(round.ending);

								output[prefix + 'duration_seconds'] = moment.duration(e.diff(s)).asSeconds();
								columnLabels[prefix + 'duration_seconds'] = 0;
							}
							else if (column == 'ending') {}
							else if (column == 'sound' && round[column] == "") {
								columnLabels[prefix + column] = 0;
								output[prefix + column] = "silence";							
							}
							else if (column == 'scenario') {
								output[prefix + 'scenario'] = scenarioRef[round.scenario];
								columnLabels[prefix + 'scenario'] = 0;
							}
							else if (column == 'selection') {
								output[prefix + 'selection'] = selectionRef[round.selection];
								output[prefix + 'correct'] = ((selectionRef[round.selection] == 'phishing' && round.phishing) || (selectionRef[round.selection] == 'normal' && !round.phishing)) ? 'correct' : 'incorrect'; 
								columnLabels[prefix + 'selection'] = 0;
								columnLabels[prefix + 'phishing'] = 0;
								columnLabels[prefix + 'correct'] = 0;
							}
							else if (column == 'email_index') {
								let scenarioIndex = (scenarioRef[round.scenario] == "Apple") ? '0' : '1';
								let s = emails[scenarioIndex];
								let type = (parseInt(round[column]) < s.phishing.length) ? 'phishing' : 'normal';
								let index = (parseInt(round[column]) < s.phishing.length) ? parseInt(round[column]) : parseInt(round[column]) - s.phishing.length;
								let selEmail = s[type][index];

								output[prefix + column] = round[column];
								output[prefix + 'email_type'] = selEmail.category;
								if (round.phishing && selEmail.strategy) output[prefix + 'phishing_type'] = selEmail.strategy;
								else output[prefix + 'phishing_type'] = 'N/A';
								columnLabels[prefix + column] = 0;
								columnLabels[prefix + 'email_type'] = 0;
								columnLabels[prefix + 'phishing_type'] = 0;
							}
							else {
								columnLabels[prefix + column] = 0;
								output[prefix + column] = round[column];
							}
						}
					}

					return fetchRounds(index + 1, tests);
				})
				.then(function (result) {
					if (result) {
						let users = [ output ];
						let u = Object.assign(columnLabels, result[0]);

						resolve([ u, users.concat(result[1]) ]);
					}
					else {
						resolve([ columnLabels, [ output ] ]);
					}
				})			
		}
	});
}

/* GET home page. */
router.get('/', (req, res, next) => {
	db.select().from(userTable).join(testTable, userTable + '.id', testTable + '.userid').orderBy(testTable + '.start', 'desc')
		.then((rows) => {
			let columnLabel = {},
				columns = Object.keys(rows[0]);
			
			// Make sure that userid column appears first
			columnLabel['userid'] = 0;
			
			// Add test rows to column and calculate duration of each test
			for (let i = 0; i < columns.length; ++i) {
				if (columns[i] === "start") { 
					for (let j = 0; j < rows.length; ++j) {
						rows[j]["duration (s)"] = "Unfinished";
						if (rows[j]["ending"] != null) {
							let s = moment(rows[j]["start"]);
							let e = moment(rows[j]["ending"]);
							rows[j]["duration (s)"] = moment.duration(e.diff(s)).asSeconds();
						}
					}
					columnLabel["duration (s)"] = 0;
				}
				columnLabel[columns[i]] = i;
			}


			// Recurse over tests to find rounds
			fetchRounds(0, rows)
				.then(function(out) {
					let csv = json2csv({ data: out[1], fields: Object.keys(Object.assign(columnLabel, out[0])) });
					res.render('admin', {
				  		users: out[1],
				  		headers: Object.keys(Object.assign(columnLabel, out[0])),
				  		moment: moment, 
				  		emails: emails,
				  		csv: csv
				  	});
				});


			// function recu (i) {
			// 	db.select().from(roundTable).where('test', r[i].id)
			// 		.then((data) => { 
			// 			for (let j = 0; j < data.length; ++j) {
			// 				let k = Object.keys(data[j]);
			// 				for (let o = 0; o < k.length; ++o) {
			// 					if (k[o] === "start") {
			// 						let s = moment(data[j]["start"]);
			// 						let e = moment(data[j]["ending"]);
			// 						r[i][(2017 + j) + "_time"] = moment.duration(e.diff(s)).asSeconds();
			// 						g[(2017 + j) + "_time"] = data[j][k[o]] = 0;
			// 					}
			// 					else if (k[o] === "ending") { }
			// 					else if (k[o] === "type") {
			// 						g['condition'] = "0";
			// 						r[i]['condition'] = conditions[data[j]['type']];
			// 					}
			// 					else if (k[o] === "selection") {
			// 						let actions = data[j][k[o]].split(':');
			// 						for (let w = 0; w < actions.length; ++w) {
			// 							if (w < 5) {
			// 								let n = ref[w].replace('first', 'one');
			// 								n = n.replace('fifth', 'five');
			// 								let sel = (2017 + j) + '_' + n;
			// 								g[sel] = 0;
			// 								g[sel + '_%'] = 0;
			// 								g[2017 + j + "_color"] = "0";
			// 								if (data[j].type > 1) r[i][2017 + j + "_color"] = "Yes";
			// 								else r[i][2017 + j + "_color"] = "No";
			// 								if (data[j].type > 0) 
			// 									r[i][sel + "_%"] = social[j + 1][ref[w].replace('_sort', '')] + '%';
			// 								else
			// 									r[i][sel + "_%"] = "N/A";
			// 								if (actions[w] == '')
			// 									r[i][sel] = 'none';
			// 								else {
			// 									r[i][sel] = {ascending: '', descending: ''};
			// 									let be = actions[w].split(',');
			// 									for (let b = 0; b < be.length; ++b) {
			// 										if (be[b].includes('a')) r[i][sel].ascending += be[b].replace('a', '') + ',';
			// 										else if (be[b].includes('d')) r[i][sel].descending += be[b].replace('d', '') + ',';
			// 									}
			// 									if (r[i][sel].ascending == '') r[i][sel].ascending = 'none';
			// 									if (r[i][sel].descending == '') r[i][sel].descending = 'none';
			// 								}
			// 							}
			// 							// Remove filtering functionality

			// 							// else {
			// 							// 	let s = "";
			// 							// 	if (data[j].type > 0) 
			// 							// 		r[i][(2017 + j) + "_" + ref[w] + "_%"] = social[j + 1][ref[w].replace('_filter', '')] + '%'
			// 							// 	else
			// 							// 		r[i][(2017 + j) + "_" + ref[w] + "_%"] = "N/A";
			// 							// 	if (data[j][k[o]][w] == '0')
			// 							// 		r[i][(2017 + j) + "_" + ref[w]] = 'none';
			// 							// 	else if (data[j][k[o]][w] == '1')
			// 							// 		r[i][(2017 + j) + "_" + ref[w]] = 'filtered';
			// 							// }
			// 						}
			// 					} else {
			// 						r[i][(2017 + j) + "_" + k[o]] = data[j][k[o]];
			// 						g[(2017 + j) + "_" + k[o]] = data[j][k[o]] = 0;
			// 					}
			// 				} 
			// 			} 
			// 			if (i + 1 < r.length)
			// 				recu(i + 1);
			// 			else {							 
			// 				try {
			// 				  	let result = json2csv({ data: r, fields: Object.keys(g) });
			// 					mturk.createClient(config).then(function (api) {
			// 					    console.log("asjmslks")
			// 						let pagesize = 10;
			// 						let page = res;
			// 						let PromiseStack = [];
			// 						let hitStack = [];
			// 						api.req('SearchHITs', { PageSize: 30 })
			// 							.then(function(res) {											
			// 								// Check for HITS in Jan or Feb
			// 								for (let i = 0; i < res.SearchHITsResult[0].HIT.length; ++i) {
			// 									if (parseInt(moment(res.SearchHITsResult[0].HIT[i].CreationTime).format("M")) < 3) {
			// 										hitStack.push(res.SearchHITsResult[0].HIT[i]);
			// 										PromiseStack.push(getMTURKData(api, res.SearchHITsResult[0].HIT[i]));
			// 									}
			// 								}
			// 								return Promise.all(PromiseStack);
			// 							})
			// 							.then((rawAss) => {
			// 								let assignments = [];
			// 								for (let i = 0; i < rawAss.length; ++i) {
			// 									assignments = assignments.concat(rawAss[i]);
			// 								}
			// 								// console.log(data);
			// 								for (var i = 0; i < r.length; ++i) {
			// 									for (var j = 0; j < assignments.length; ++j) {
			// 										if (r[i].usercode === assignments[j].survey) {
			// 											r[i].workerid = assignments[j].worker;
			// 											r[i].assignment = assignments[j].assignment;
			// 											r[i].bonus = assignments[j].bonused;
			// 											db(userTable).update({ workerid: assignments[j].worker }).where('usercode', assignments[j].survey).then(() => {});		
			// 											if (!r[i].bonus) {
			// 												// Automatic bonusing
			// 												// api.req('GrantBonus', 
			// 												// 	{ AssignmentId: assignments[j].assignment, BonusAmount: { Amount: Math.round(r[i]['total_return']) / 100 + '', CurrencyCode: 'USD' }, WorkerId: assignments[j].worker, Reason: "Investment Study Bonus" });	
			// 												// r[i].bonus = true;
			// 											}
			// 										}
			// 									}
			// 								}
			// 								page.render('admin', {
			// 							  		social: social,
			// 							  		marketdata: marketdata,
			// 							  		users: r,
			// 							  		headers: Object.keys(g),
			// 							  		moment: moment, 
			// 							  		csv: result,
			// 							  		questions: questions,
			// 							  		marketvalues: marketvalues,
			// 							  		percentages: percentages
			// 							  	});
			// 							});
			// 					});
			// 				} catch (err) {
			// 				  console.error(err);
			// 				}
			// 			}
			// 		});
			// }
			// ;
		})
		.then((j) => {
		})
});

module.exports = router;


/*

														  	*/
