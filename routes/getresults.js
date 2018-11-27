let express = require('express');
let router = express.Router();
let mturk = require('mturk-api');
let xml = require("xml-parse");
let db = require('../db.js');
let moment = require('moment');
let json2csv = require('json2csv');
let fs = require('fs');

let emails = require('../data/emails.json')

let u = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
let t = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
let r = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';

const scenarioRef = ['Apple', 'Student'];
const selectionRef = ['phishing', 'normal'];

router.get('/', (req, res, next) => {
	let columnLabel = {}
	let out = []
	let currTest = -1;
	let firstRound = -1;

	db(r).join(t, r + '.testid', '=', t + '.id').join(u, t + '.userid', u + '.id').select(t + '.start as tstart', t + '.ending as tend', t+'.*', u + '.*', r + '.*')
		.orderBy(t + '.start', 'asc')
		.orderBy(r + '.id', 'asc')
		.whereNotNull(t + '.ending')
		.then((rows) => {
			columnLabel = [
				"userid", "testid","round", "test_duration (s)", "round_duration (s)", "scenario", "sound", "email_index", "selection", 
				"phishing", "result", "email_type", "phishing_type", "links_clicked", "total_correct", "left_choice", "feedback", "q1", "q2", "q3", "age", "gender", "email", "trust" 
			]
			for (let i = 0; i < rows.length; ++i) {
				if (rows[i].userid != currTest) {
					currTest = rows[i].userid;
					firstRound = rows[i].id;
				}
				for ( field in rows[i] ) {
					rows[i]['round'] = rows[i]['id'] - firstRound + 1
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
						if (rows[i]['phishing']) {
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
						if (rows[i].isphishing) rows[i]['phishing_type'] = selEmail.strategy;
						else rows[i]['phishing_type'] = 'N/A';
					}

					rows[i]['result'] = (rows[i]['selection'] == rows[i]['phishing']) ? 'correct' : 'incorrect'
				}
				out.push(rows[i]);
			}
			let csv = json2csv({ data: out, fields: columnLabel });
			res.setHeader('Content-disposition', 'attachment; filename=data.csv');
			res.setHeader('Content-type', 'text/plain');
			res.charset = 'UTF-8';
			res.write(csv);
			res.end();
		});

});

module.exports = router;