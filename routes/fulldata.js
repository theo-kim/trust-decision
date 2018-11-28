let express = require('express');
let router = express.Router();
let mturk = require('mturk-api');
let xml = require("xml-parse");
let db = require('../db.js');
let moment = require('moment');
let fs = require('fs');
let _ = require('underscore');

const xlsx = require('xlsx');

let emails = require('../data/emails.json')

let u = 'dev_participants';
let t = 'dev_tests';
let r = 'dev_rounds';
let evalTable = 'dev_evals'; 


const scenarioRef = ['Apple', 'Student'];
const selectionRef = ['phishing', 'normal'];

router.get('/', (req, res, next) => {
	let workbook = xlsx.utils.book_new();
	let oldworkbook = xlsx.readFile('data.xlsx');

	let oldraw = xlsx.utils.sheet_to_json(oldworkbook.Sheets["Raw Data"])
	let lastid = oldraw[oldraw.length - 1].id

	let columnLabel = {}
	let out = []
	let currTest = -1;
	let firstRound = -1;
	let roundStarts = {};
	let datatable = {};

	db(r).join(t, r + '.testid', '=', t + '.id').join(u, t + '.userid', u + '.id').select(t + '.start as tstart', t + '.ending as tend', t+'.*', u + '.*', r + '.*')
		.orderBy(t + '.start', 'asc')
		.orderBy(r + '.id', 'asc')
		.whereNotNull(t + '.ending')
		.andWhere(t + '.id', '>', lastid)
		.then((rows) => {
			if (rows.length == 0) {
				res.send(xlsx.write(oldworkbook, {type:'buffer'}));
			}
			else {
				columnLabel = [
					"userid", "round", "test_duration (s)", "round_duration (s)", "scenario", "sound", "email_index", "selection", 
					"phishing", "result", "email_type", "phishing_type", "total_correct", "left_choice", "feedback", "age", "gender", "email", "gmail" 
				]
				for (let i = 0; i < rows.length; ++i) {
					if (roundStarts[rows[i]['testid']] == null) {
						roundStarts[rows[i]['testid']] = 1;
						datatable[rows[i]['testid']] = { data: [], sounds: {}, total: 0}
					}
					else roundStarts[rows[i]['testid']] += 1;
					for ( field in rows[i] ) {
						rows[i]['round'] = roundStarts[rows[i]['testid']];
						if (field == 'tend') {
							let s = moment(rows[i]["tstart"]);
							let e = moment(rows[i]["tend"]);
							rows[i]["test_duration (s)"] = moment.duration(e.diff(s)).asSeconds();
						}
						else if (field == 'tstart') {}
						else if (field == 'start') {
							let s = moment(rows[i]["start"]);
							let e = moment(rows[i]["ending"]);
							rows[i]["round_duration (s)"] = moment.duration(e.diff(s)).asSeconds();
						}
						else if (field == 'trust') {
							rows[i]['gmail'] = rows[i]['trust']
						}
						else if (field == 'ending') {}
						else if (field == 'phishing') {
							if (rows[i]['email_index'] < 4) {
								rows[i]['phishing'] = 'phishing';
								rows[i]['isphishing'] = true;
							} 
							else { 
								rows[i]['phishing'] = 'normal';
								rows[i]['isphishing'] = false;
							} 
						}
						else if (field == 'scenario') {
							rows[i]['scenarioIndex'] = rows[i]['scenario'];
							rows[i]['scenario'] = scenarioRef[rows[i]['scenario']]
						}
						else if (field == 'selection') {
							rows[i]['selection'] = selectionRef[rows[i]['selection']]
						}
						else if (field == 'sound' && rows[i][field] == "") {
							rows[i][field] = 'silence'	
						}
						else if (field == 'email_index') {
							let scenarioIndex = rows[i].scenarioIndex;
							let s = emails[scenarioIndex];
							let type = (parseInt(rows[i][field]) < s.phishing.length) ? 'phishing' : 'normal';
							let index = (parseInt(rows[i][field]) < s.phishing.length) ? parseInt(rows[i][field]) : parseInt(rows[i][field]) - s.phishing.length;
							let selEmail = s[type][index];

							rows[i]['email_type'] = selEmail.category;
							if (type == "phishing") rows[i]['phishing_type'] = selEmail.strategy;
							else rows[i]['phishing_type'] = 'N/A';
						}

						rows[i]['result'] = (rows[i]['selection'] == rows[i]['phishing']) ? 'correct' : 'incorrect'
					}
					datatable[rows[i]['testid']].data.push((_.pick(rows[i], columnLabel)));
				}

				return db.select().from(evalTable);
			}
		})
		.then((result) => {
			const field = ["testid", "sound", "eventful", "calm", "annoying", "uneventful", "monotonous", "pleasant", "chaotic", "vibrant", "eventfulness", "pleasantness"];
			const datafields = ["round_duration (s)", "scenario", "sound", "email_index", "email_type", "phishing_type", "selection", "phishing", "result"];
			const wsfields = ["duration_seconds", "scenario", "sound", "email_index", "email_type", "phishing_type", "selection", "phishing", "correct"];
			
			// incorporate sound data into main datatable object
			for (let i = 0; i < result.length; ++i) {
				if (datatable[result[i].testid]) {
					datatable[result[i].testid].sounds[result[i].sound] = _.pick(result[i], field);
				}
			}

			// Count total correct
			for (let testid in datatable) {
				for (let i = 0; i < datatable[testid].data.length; ++i) {
					if (datatable[testid].data[i].result == "correct") {
						datatable[testid].total += 1;
					}
				}
			}

			// Define JSON objects for eventual conversion to sheets
			let sheet1json = [];
			let sheet2json = [];
			let sheet3json = [];
			let sheet4json = [];

			for (let testid in datatable) {
				for (let i = 0; i < datatable[testid].data.length; ++i) {
					datatable[testid].data[i]["total_correct"] = datatable[testid].total;
					sheet1json.push(datatable[testid].data[i]);
				}
				for (let sound in datatable[testid].sounds) {
					sheet2json.push(datatable[testid].sounds[sound]);
					sheet2json[sheet2json.length - 1].user = sheet2json[sheet2json.length - 1].testid
					delete sheet2json[sheet2json.length - 1].testid
				}

				sheet3json.push({
									id: testid, 
									age: datatable[testid].data[0]["age"],
									gender: datatable[testid].data[0]["gender"],
									email: datatable[testid].data[0]["email"],
									gmail: datatable[testid].data[0]["trust"],
									"left_choice": datatable[testid].data[0]["left_choice"],
									"duration (s)":	datatable[testid].data[0]["test_duration (s)"],
									"total_correct": datatable[testid].total
								});

				for (let i = 0; i < datatable[testid].data.length; ++i) {
					for (let j = 0; j < datafields.length; ++j) {
						var col = datafields[j];
						var colname = "round_" + (i + 1) + "_" + wsfields[j];
						sheet3json[sheet3json.length - 1][colname] = datatable[testid].data[i][col];
					}
				}
				for (let sound in datatable[testid].sounds) {
					for (let k in datatable[testid].sounds[sound]){
						if (k != "testid" && k != "sound")	
							sheet3json[sheet3json.length - 1]["sound_evaluation_" + sound+ "_" + k] = datatable[testid].sounds[sound][k]
					}
				}
			}

			// Update new data with old data
			sheet1json = xlsx.utils.sheet_to_json(oldworkbook.Sheets["Decision Data"]).concat(sheet1json)
			sheet2json = xlsx.utils.sheet_to_json(oldworkbook.Sheets["Sound Data"]).concat(sheet2json)
			sheet3json = xlsx.utils.sheet_to_json(oldworkbook.Sheets["Raw Data"]).concat(sheet3json)

			// Count FP, FN, TP, and TN for each user
			for (let j = 0; j < sheet1json.length; ++j) {
				if (j == 0 || sheet1json[j].userid != sheet1json[j - 1].userid) {
					sheet4json.push({
						user: sheet1json[j].userid,
						"Total Correct": sheet1json[j]["total_correct"],
						"Correct Phishing": 0,
						"Correct Normal": 0,
						"Wrong Phishing": 0,
						"Wrong Normal": 0,
						"Recall": 0,
						"Precision": 0,
						"Accuracy": 0
					})
				}

				let c = sheet4json.length - 1;

				if (sheet1json[j].result == "correct") {
					if (sheet1json[j].phishing == "normal") {
						sheet4json[c]["Correct Normal"] += 1;
					}
					else {
						sheet4json[c]["Correct Phishing"] += 1;	
					}
				}
				else {
					if (sheet1json[j].phishing == "normal") {
						sheet4json[c]["Wrong Normal"] += 1;
					}
					else {
						sheet4json[c]["Wrong Phishing"] += 1;	
					}
				}

				// Calculate Precision Recall and Accuracy
				sheet4json[c]["Recall"] = sheet4json[c]["Correct Phishing"] / (sheet4json[c]["Correct Phishing"] + sheet4json[c]["Wrong Normal"])
				sheet4json[c]["Precision"] = sheet4json[c]["Correct Phishing"] / (sheet4json[c]["Correct Phishing"] + sheet4json[c]["Wrong Phishing"])
				sheet4json[c]["Accuracy"] = sheet4json[c]["Total Correct"] / ((sheet4json[c]["Correct Phishing"] + sheet4json[c]["Correct Normal"] + sheet4json[c]["Wrong Phishing"] + sheet4json[c]["Wrong Normal"]))
				
				if (isNaN(sheet4json[c]["Recall"])) sheet4json[c]["Recall"] = 0;
				if (isNaN(sheet4json[c]["Precision"])) sheet4json[c]["Precision"] = 0;

			}
			
			// Calculate Summary Statistics for Sound Data
			let sheet5json = [{
						sound: "silence",
						"avg_vibrant": 0,
						"avg_pleasant": 0,
						"avg_chaotic": 0,
						"avg_eventful": 0,
						"avg_calm": 0,
						"avg_annoying": 0,
						"avg_uneventful": 0,
						"avg_monotonous": 0,
						"avg_eventfulness": 0,
						"avg_pleasantness": 0,
					}]
			let includedSounds = {}
			let avgPleasantness = {silence: 0}
			for (let i = 0; i < sheet2json.length; ++i) {
				if (i == 0 || !(sheet2json[i].sound in includedSounds)) {
					sheet5json.push({
						sound: sheet2json[i].sound,
						"avg_vibrant": 0,
						"avg_pleasant": 0,
						"avg_chaotic": 0,
						"avg_eventful": 0,
						"avg_calm": 0,
						"avg_annoying": 0,
						"avg_uneventful": 0,
						"avg_monotonous": 0,
						"avg_eventfulness": 0,
						"avg_pleasantness": 0,
					})
					includedSounds[sheet2json[i].sound] = 0
				}

				// Count the new occurence of the sound
				includedSounds[sheet2json[i].sound]++

				// Look for index of row with current sound
				let c = 0;
				for (let j = 0; j < sheet5json.length; ++j) {
					if (sheet5json[j].sound == sheet2json[i].sound) {
						c = j;
						break;
					}
				}

				// Update average values
				for (let field in sheet5json[c]) {
					if (field == "sound") continue;
					let avg = sheet5json[c][field]
					avg *= (includedSounds[sheet2json[i].sound] - 1)
					avg += parseInt(sheet2json[i][field.replace("avg_", "")])
					avg /= includedSounds[sheet2json[i].sound]
					sheet5json[c][field] = avg
				}

				avgPleasantness[sheet2json[i].sound] = sheet5json[c]["avg_pleasantness"]
			}

			// Get TP, FP, TN, FN, Precision/Recall/Accuracy for emails related to sounds
			let sheet6json = []
			includedSounds = {}
			for (let i = 0; i < sheet1json.length; ++i) {
				if (i == 0 || !(sheet1json[i].sound in includedSounds)) {
					sheet6json.push({
						sound: sheet1json[i].sound,
						"avg_pleasantness": avgPleasantness[sheet1json[i].sound],
						"Total Occurence": 0,
						"Total Correct": 0,
						"Correct Phishing": 0,
						"Correct Normal": 0,
						"Wrong Phishing": 0,
						"Wrong Normal": 0,
						"Recall": 0,
						"Precision": 0,
						"Accuracy": 0
					})
					includedSounds[sheet1json[i].sound] = 0
				}

				// Count the new occurence of the sound
				includedSounds[sheet1json[i].sound]++

				// Look for index of row with current sound
				let c = 0;
				for (let j = 0; j < sheet6json.length; ++j) {
					if (sheet6json[j].sound == sheet1json[i].sound) {
						c = j;
						break;
					}
				}

				sheet6json[c]["Total Occurence"] = includedSounds[sheet1json[i].sound]

				if (sheet1json[i].result == "correct") {
					sheet6json[c]["Total Correct"] += 1;
					if (sheet1json[i].phishing == "normal") {
						sheet6json[c]["Correct Normal"] += 1;
					}
					else {
						sheet6json[c]["Correct Phishing"] += 1;	
					}
				}
				else {
					if (sheet1json[i].phishing == "normal") {
						sheet6json[c]["Wrong Normal"] += 1;
					}
					else {
						sheet6json[c]["Wrong Phishing"] += 1;	
					}
				}

				// Calculate Precision Recall and Accuracy
				sheet6json[c]["Recall"] = sheet6json[c]["Correct Phishing"] / (sheet6json[c]["Correct Phishing"] + sheet6json[c]["Wrong Normal"])
				sheet6json[c]["Precision"] = sheet6json[c]["Correct Phishing"] / (sheet6json[c]["Correct Phishing"] + sheet6json[c]["Wrong Phishing"])
				sheet6json[c]["Accuracy"] = sheet6json[c]["Total Correct"] / sheet6json[c]["Total Occurence"]
				
				if (isNaN(sheet6json[c]["Recall"])) sheet6json[c]["Recall"] = 0;
				if (isNaN(sheet6json[c]["Precision"])) sheet6json[c]["Precision"] = 0;
			}

			// Convert JSON objects to XLSX sheets
			let sheet1 = xlsx.utils.json_to_sheet(sheet1json);
			xlsx.utils.book_append_sheet(workbook, sheet1, "Decision Data");
			let sheet2 = xlsx.utils.json_to_sheet(sheet2json);
			xlsx.utils.book_append_sheet(workbook, sheet2, "Sound Data");
			let sheet3 = xlsx.utils.json_to_sheet(sheet3json);
			xlsx.utils.book_append_sheet(workbook, sheet3, "Raw Data");
			let sheet4 = xlsx.utils.json_to_sheet(sheet4json);
			xlsx.utils.book_append_sheet(workbook, sheet4, "User Precision and Recall");
			let sheet5 = xlsx.utils.json_to_sheet(sheet5json);
			xlsx.utils.book_append_sheet(workbook, sheet5, "Sound Summary Statistics");
			let sheet6 = xlsx.utils.json_to_sheet(sheet6json);
			xlsx.utils.book_append_sheet(workbook, sheet6, "Sound Precision and Recall");
			res.setHeader('Content-disposition', 'attachment; filename=data.xlsx');
			res.setHeader('Content-type', 'text/plain');
			res.charset = 'UTF-8';
			res.send(xlsx.write(workbook, {type:'buffer'}));
			res.end();
		});

});

module.exports = router;