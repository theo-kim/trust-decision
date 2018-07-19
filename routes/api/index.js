var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
var adminAPI = require('./admin.js');
var emails = require('../../data/emails.json');

var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';
var evalTable = (process.env.DEBUG) ? 'dev_evals' : 'prod_evals';

/* GET home page. */
router.route('/participant')
	.post((req, res, next) => {
		const data = {
			gender: req.body.gender,
			email: req.body.email,
			trust: req.body.trust,
			age: req.body.age,
		};

		data["left_choice"] = (req.cookies.left==0 ? "Report Phishing" : "Nothing to Report");

		db(userTable).returning('id').insert(data)
			.then((id) => {
				var dt = new Date();
				var utcDate = dt.toUTCString();
				const nData = {
					userid: parseInt(id),
					start: utcDate,
					"total_correct": 0,
				};
				return db(testTable).returning(['id', 'userid']).insert(nData);
			})
			.then((data) => {
				console.log(data[0].id);
				res.cookie('test', data[0].id, { maxAge : 8.64e7 });
				res.cookie('user', data[0].userid, { maxAge : 8.64e7 });
				res.json(data);
			});
	});

router.route('/endsurvey')
	.post((req, res, next) => {
		let data = req.body;
		var dt = new Date();
		var utcDate = dt.toUTCString();
		data.ending = utcDate;
		db(testTable).update(data, "id").where('id', req.cookies.test)
			.then((dk) => res.send("success"))		
	});

router.route('/round')
	.post((req, res, next) => {
		let data = req.body;

		var dt = new Date();
		var utcDate = dt.toUTCString();
		data.ending = utcDate;
		
		let totalEmails = emails[data.scenario].phishing.length + emails[data.scenario].normal.length
		data.phishing = (data.email_index < (totalEmails - emails[data.scenario].phishing.length));

		db(roundTable).returning('id').insert(data).then((d) => {
			return db(testTable).select(['total_correct']).where('id', data.testid);
		})
		.then((dj) => {
			var correct = parseInt(data.selection) != data.phishing;
			return db(testTable).update({'total_correct': dj[0]['total_correct'] + correct}).where('id', data.testid);
		})
		.then((dk) => res.send("success"))			
	});

router.route('/sounds')
	.post((req, res, next) => {
		const data = req.body;

		data.testid = parseInt(req.cookies.test);

		// console.log(data);

		db(evalTable).returning('id').insert(data)
			.then((id) => {
				res.cookie('eval', parseInt(req.cookies.eval) + 1, { maxAge : 8.64e7 });
				res.send(id);
			});
	});	

router.use('/admin', adminAPI);

module.exports = router;
