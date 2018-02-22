var express = require('express');
var router = express.Router();
var questions = require('../data/endsurveyquestions.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round && req.cookies.round > 0) {
		res.render('endsurvey', { questions: questions });
	}
	else {
		next();
	}
});

module.exports = router;
