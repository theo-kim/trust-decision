var express = require('express');
var router = express.Router();

var finData = require('../data/marketdata.json');
var abstract = require('../data/abstract.json');
var social = require('../data/social.json');
var marketvalues = require('../data/marketvalues.json');
var headertext = require('../data/headertext.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round || !req.cookies.rand) { 
		next();
	}
	else {
		if (parseInt(req.cookies.round) < 10) 
			res.render('study', {
				data: finData,
				round: parseInt(req.cookies.round),
				social: social,
				rand: parseInt(req.cookies.rand),
				test: req.cookies.test,
				user: req.cookies.user,
				marketvalues: marketvalues,
				text: headertext[parseInt(req.cookies.rand)],
				retur: parseFloat(req.cookies.return)
			});
		else
			res.redirect('/endsurvey');
	}
});

module.exports = router;
