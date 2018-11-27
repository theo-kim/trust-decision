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

let u = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
let t = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
let r = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
let evalTable = (process.env.DEBUG) ? 'dev_evals' : 'prod_evals'; 


const scenarioRef = ['Apple', 'Student'];
const selectionRef = ['phishing', 'normal'];

router.get('/', (req, res, next) => {
	let workbook = xlsx.utils.book_new();

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
		.andWhere(t + '.id', '>', 54)
		.then((rows) => {
			columnLabel = [
				"userid", "testid", "round", "test_duration (s)", "round_duration (s)", "scenario", "sound", "email_index", "selection", 
				"phishing", "result", "email_type", "phishing_type", "total_correct", "left_choice", "feedback", "age", "gender", "email", "trust" 
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
				// out.push(_.pick(rows[i], columnLabel));

			}

			return db.select().from(evalTable);
		})
		.then((result) => {
			const field = ["testid", "sound", "eventful", "calm", "annoying", "uneventful", "monotonous", "pleasant", "chaotic", "vibrant", "eventfulness", "pleasantness"];
			const datafields = ["round_duration (s)", "scenario", "sound", "email_index", "email_type", "phishing_type", "selection", "phishing", "result"];
			for (let i = 0; i < result.length; ++i) {
				// result[i] = _.pick(result[i], field);
				if (datatable[result[i].testid]) {
					datatable[result[i].testid].sounds[result[i].sound] = _.pick(result[i], field);
				}
			}

			for (let testid in datatable) {
				for (let i = 0; i < datatable[testid].data.length; ++i) {
					if (datatable[testid].data[i].result == "correct") {
						datatable[testid].total += 1;
					}
				}
			}

			sheet1json = [];
			sheet2json = [];
			sheet3json = [];
			for (let testid in datatable) {
				for (let i = 0; i < datatable[testid].data.length; ++i) {
					datatable[testid].data[i]["total_correct"] = datatable[testid].total;
					sheet1json.push(datatable[testid].data[i]);
				}
				for (let sound in datatable[testid].sounds) {
					sheet2json.push(datatable[testid].sounds[sound]);
				}

				sheet3json.push({
									id: testid, 
									age: datatable[testid].data[0]["age"],
									gender: datatable[testid].data[0]["gender"],
									email: datatable[testid].data[0]["email"],
									trust: datatable[testid].data[0]["trust"],
									"left_choice": datatable[testid].data[0]["left_choice"],
									"duration (s)":	datatable[testid].data[0]["test_duration (s)"],
									"total_correct": datatable[testid].total
								});

				for (let i = 0; i < datatable[testid].data.length; ++i) {
					for (let col in datatable[testid].data[i]) {
						if (datafields.indexOf(col) > -1)
							sheet3json[sheet3json.length - 1]["round_" + (i + 1) + "_" + col] = datatable[testid].data[i][col];
					}
				}
				for (let sound in datatable[testid].sounds) {
					for (let k in datatable[testid].sounds[sound]){
						if (k != "testid" && k != "sound")	
							sheet3json[sheet3json.length - 1]["sound_evaluation_" + sound+ "_" + k] = datatable[testid].sounds[sound][k]
					}
				}
			} 

			let sheet1 = xlsx.utils.json_to_sheet(sheet1json);
			xlsx.utils.book_append_sheet(workbook, sheet1, "Decision Data");
			let sheet2 = xlsx.utils.json_to_sheet(sheet2json);
			xlsx.utils.book_append_sheet(workbook, sheet2, "Sound Data");
			let sheet3 = xlsx.utils.json_to_sheet(sheet3json);
			xlsx.utils.book_append_sheet(workbook, sheet3, "Raw Data");
			res.setHeader('Content-disposition', 'attachment; filename=data.xlsx');
			res.setHeader('Content-type', 'text/plain');
			res.charset = 'UTF-8';
			res.send(xlsx.write(workbook, {type:'buffer'}));
			res.end();
		});

});

module.exports = router;