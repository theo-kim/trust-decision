var express = require('express');
var router = express.Router();

var emails = require('../data/emails.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		if (parseInt(req.cookies.round) < 10) 
			res.render('study', {
				message:emails[0][0].phishing.message,
				subject:"Hello World",
				toline:"you, me",
				fro: "Teddy Kim",
				faddress: "teddy@teddy.com",
				timestamp: "Feb 13 (ten days ago)"
			});
		else
			res.redirect('/endsurvey');
	}
});

module.exports = router;
