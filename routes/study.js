var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');
var scenarios = require('../data/scenarios.json');

var sounds = ["", "/sounds/city.mp3", "/sounds/concert.mp3", "/sounds/country.mp3", "/sounds/crowd.mp3", "/sounds/dogpark.wav", "/sounds/traffic.wav", "/sounds/siren.wav", "/sounds/park.wav", "/sounds/office.mp3"]
/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		const s = parseInt(req.cookies.scenario);
		const r = parseInt(req.cookies.round);
		const l = parseInt(req.cookies.left);

		if (r === 0) {
			res.render('scenario', {name: scenarios[0].name, body: scenarios[0].body});
		}
		else if (r === emails[0].normal.length + emails[0].phishing.length + 1) {
			res.cookie('scenario', 1, { maxAge : 8.64e7 });
			res.cookie('emails', 0, { maxAge : 8.64e7 });
			res.render('scenario', {name: scenarios[1].name, body: scenarios[1].body});
		}
		else if (r < emails[0].normal.length + emails[0].phishing.length + emails[1].normal.length + emails[1].phishing.length + 2) {
			// Get random sound that has been played less than 5 times
			const playedSounds = req.cookies.sound;
			let randSound;

			do {
				randSound = Math.floor(Math.random() * 10);
			} while (parseInt(playedSounds[randSound]) > 4)
			// END

			// Get random email, but see if it was used already
			const chosenEmail = req.cookies.emails,
				nNormal = emails[s].normal.length,
				nPhishing = emails[s].phishing.length,
				nEmails = nNormal + nPhishing;

			let randomEmail, type = 'phishing', selEmail, emailIndex;

			do {
				randomEmail = Math.floor(Math.random() * nEmails);
			} while (parseInt(chosenEmail) & Math.pow(2, randomEmail))

			if (randomEmail >= nPhishing) { randomEmail -= nPhishing; type = 'normal'; }

			selEmail = emails[s][type][randomEmail];
			// selEmail = emails[s]['normal'][2];
			
			emailIndex = randomEmail + ((type === 'normal') * nPhishing);
			// END
			
			// Render Page
			res.render('study', {	
				message: selEmail.message,
				subject: selEmail.subject,
				toline: selEmail.to.name,
				fro: selEmail.from.name,
				faddress: selEmail.from.email,
				taddress: selEmail.to.email,
				timestamp: selEmail.timestamp,
				bcc: selEmail.bcc,
				cc: selEmail.cc,
				scenario: scenarios[s],
				sound: sounds[randSound],
				soundNum: randSound,
				emailIndex: emailIndex,
				left: l
			});
			// END
		}
		else if (parseInt(req.cookies.eval) < sounds.length - 1) {
			res.render('soundsurvey', { sound: sounds[parseInt(req.cookies.eval) + 1] });
		}
		else {
			res.render('endsurvey', { questions: { 0: "Do you like icecream?", 1: "Do you like pizza?", 2: "Do you like fruit?", } });
		}
	}
});

module.exports = router;
