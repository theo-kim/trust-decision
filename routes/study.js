var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');
var scenarios = require('../data/scenarios.json');

var sounds = ["/sounds/city.mp3", "/sounds/concert.mp3", "/sounds/country.mp3", "/sounds/crowd.mp3", "/sounds/dogpark.wav", "/sounds/traffic.wav", "/sounds/siren.wav",]
/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		const s = parseInt(req.cookies.scenario);
		const r = parseInt(req.cookies.round);

		if (r === 0) {
			res.render('scenario', {name: scenarios[0].name, body: scenarios[0].body});
		}
		else if (r === 4) {
			res.cookie('scenario', 1, { maxAge : 8.64e7 });
			res.render('scenario', {name: scenarios[1].name, body: scenarios[1].body});
		}
		else if (r < 10) {
			console.log(s);
			console.log(r - (s * 4) - 1);
			res.render('study', {	
				message:emails[s][r - (s * 4) - 1].phishing.message,
				subject:emails[s][r - (s * 4) - 1].phishing.subject,
				toline:emails[s][r - (s * 4) - 1].phishing.to.name,
				fro:emails[s][r - (s * 4) - 1].phishing.from.name,
				faddress:emails[s][r - (s * 4) - 1].phishing.from.email,
				taddress:emails[s][r - (s * 4) - 1].phishing.to.email,
				timestamp:emails[s][r - (s * 4) - 1].phishing.timestamp,
				bcc:emails[s][r - (s * 4) - 1].phishing.bcc,
				cc:emails[s][r - (s * 4) - 1].phishing.cc,
				scenario: scenarios[s],
				sound: sounds[req.cookies.round - 1],
			});
		}
		else res.redirect('/endsurvey');
	}
});

module.exports = router;
