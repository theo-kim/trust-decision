var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var mturk = require('mturk-api');
var xml = require("xml-parse");

var questions = require('../../data/endsurveyquestions.json');
var values = require('../../data/marketvalues.json');
var svalues = require('../../data/social.json');

var qfileName = '../../../data/endsurveyquestions.json';
var vfileName = '../../../data/marketvalues.json';
var sfileName = '../../../data/social.json';

var config = {
    access: 'AKIAIM5RDWIKG2R3D2HA',
    secret: '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',
    //real or test
    sandbox: false
};

router.route('/questions')
	.post((req, res, next) => {
		var result = _.defaults(req.body, questions);
		var pathName = path.join(__dirname, 'output', qfileName);
		fs.writeFile(pathName, JSON.stringify(result), (err) => {
			if (!err) res.send('success');
			else {
				console.log(err);
				res.status(400).send('error');
			}
		})
	});

router.route('/values')
	.post((req, res, next) => {
		var d = JSON.parse(req.body.data);
		var o = Object.keys(d);
		for (var i = 0; i < o.length; ++i) {
			if (values[o[i]]) d[o[i]] = _.defaults(d[o[i]], values[o[i]])
		}
		d = _.defaults(d, values);
		var pathName = path.join(__dirname, 'output', vfileName);
		fs.writeFile(pathName, JSON.stringify(d), (err) => {
			if (!err) res.send('success');
			else {
				console.log(err);
				res.status(400).send('error');
			}
		})
	})

router.route('/percentages')
	.post((req, res, next) => {
		var d = JSON.parse(req.body.data);
		var o = Object.keys(d);
		for (var i = 0; i < o.length; ++i) {
			if (svalues[o[i]]) d[o[i]] = _.defaults(d[o[i]], svalues[o[i]])
		}
		d = _.defaults(d, svalues);
		console.log(d);
		var pathName = path.join(__dirname, 'output', sfileName);
		fs.writeFile(pathName, JSON.stringify(d), (err) => {
			if (!err) res.send('success');
			else {
				console.log(err);
				res.status(400).send('error');
			}
		})
	})

router.route('/bonus')
	.post((req, res, next) => {
		console.log(req.body);
		var worker = req.body.worker;
		var ass = req.body.ass;
		var bonus = req.body.amount;

		mturk.createClient(config).then(function (api) {
			console.log("starting")
			let pagesize = 10;
			let page = res;
			api.req('GetBonusPayments', { AssignmentId: ass })
				.then(function(res) {
					if (res.GetBonusPaymentsResult[0].TotalNumResults == 0) {
						api.req('GrantBonus', { AssignmentId: ass, BonusAmount: { Amount: bonus, CurrencyCode: 'USD' }, WorkerId: worker, Reason: "Investment Study Bonus" })
							.then(() => {
								page.send('success');
							})
					}
					else {
						page.send('fail');
					}
				});
		}).catch(console.error);
	})

module.exports = router;
