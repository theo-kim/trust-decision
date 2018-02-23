var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		if (parseInt(req.cookies.round) === 0) {
			res.render('scenario', {text: 'Hello World'});
		}
		else if (parseInt(req.cookies.round) < 10) 
			res.render('study', {
				message:emails[0][0].phishing.message,
				subject:emails[0][0].phishing.subject,
				toline:emails[0][0].phishing.to.name,
				fro:emails[0][0].phishing.from.name,
				faddress:emails[0][0].phishing.from.email,
				taddress:emails[0][0].phishing.to.email,
				timestamp:emails[0][0].phishing.timestamp
			});
		else
			res.redirect('/endsurvey');
	}
});

module.exports = router;
