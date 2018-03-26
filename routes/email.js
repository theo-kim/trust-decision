var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');

var sounds = ["", "/sounds/city.mp3", "/sounds/concert.mp3", "/sounds/country.mp3", "/sounds/crowd.mp3", "/sounds/dogpark.wav", "/sounds/traffic.wav", "/sounds/siren.wav", "/sounds/park.wav", "/sounds/office.mp3"]
/* GET home page. */
router.get('/:scenario/:id', (req, res, next) => {
	if (!req.params.id || !req.params.scenario) { 
		next();
	}
	else {	
		req.params.id = parseInt(req.params.id);
		let scenarioIndex = (req.params.scenario == "Apple") ? '0' : '1';
		let s = emails[scenarioIndex];
		let type = (req.params.id < s.phishing.length) ? 'phishing' : 'normal';
		let index = (req.params.id < s.phishing.length) ? (req.params.id) : req.params.id - s.phishing.length;
		let selEmail = s[type][index];

		// Render Page
		res.render('email', {	
			message: selEmail.message,
			subject: selEmail.subject,
			toline: selEmail.to.name,
			fro: selEmail.from.name,
			faddress: selEmail.from.email,
			taddress: selEmail.to.email,
			timestamp: selEmail.timestamp,
			bcc: selEmail.bcc,
			cc: selEmail.cc,
		});
		// END
	}
});

module.exports = router;
