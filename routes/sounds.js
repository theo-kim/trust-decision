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
let e = 'prod_evals';//(process.env.DEBUG) ? 'dev_evals' : 'prod_evals';

const scenarioRef = ['Apple', 'Student'];
const selectionRef = ['phishing', 'normal'];

router.get('/', (req, res, next) => {
	let columnLabel = {}
	let out = []
	let currTest = -1;
	let firstRound = -1;

	db.select(e + '.*').from(e)
		.orderBy(e + '.testid', 'asc')
		.orderBy(e + '.id', 'asc')
		.then((rows) => {
			console.log(rows);
			let csv = json2csv({ data: rows, fields: Object.keys(rows[0]) });
			res.setHeader('Content-disposition', 'attachment; filename=sounds.csv');
			res.setHeader('Content-type', 'text/plain');
			res.charset = 'UTF-8';
			res.write(csv);
			res.end();
		});

});

module.exports = router;