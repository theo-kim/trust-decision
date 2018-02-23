var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');
var scenarios = require('../data/scenarios.json');

var sounds = ["/sounds/city.mp3", "/sounds/concert.mp3", "/sounds/country.mp3", "/sounds/crowd.mp3", "/sounds/dogpark.mp3", "/sounds/traffic.wav",]
/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		if (parseInt(req.cookies.round) === 0) {
			res.render('scenario', {name: scenarios[0].name, body: scenarios[0].body});
		}
		else if (parseInt(req.cookies.round) === 4) {
			res.render('scenario', {name: scenarios[1].name, body: scenarios[1].body});
			res.cookie('scenario', 1, { maxAge : 8.64e7 });
		}
		else if (parseInt(req.cookies.round) < 10) {
			res.render('study', {	
				message:emails[req.cookies.scenario][req.cookies.round - 1].phishing.message,
				subject:emails[req.cookies.scenario][req.cookies.round - 1].phishing.subject,
				toline:emails[req.cookies.scenario][req.cookies.round - 1].phishing.to.name,
				fro:emails[req.cookies.scenario][req.cookies.round - 1].phishing.from.name,
				faddress:emails[req.cookies.scenario][req.cookies.round - 1].phishing.from.email,
				taddress:emails[req.cookies.scenario][req.cookies.round - 1].phishing.to.email,
				timestamp:emails[req.cookies.scenario][req.cookies.round - 1].phishing.timestamp,
				scenario: scenarios[req.cookies.scenario],
				sound: sounds[req.cookies.round - 1],
			});
		}
		else res.redirect('/endsurvey');
	}
});

module.exports = router;
