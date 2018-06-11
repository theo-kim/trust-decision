var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round && req.cookies.round > 0) {
		res.render('endsurvey', { questions: { 0: "Do you like icecream?", 1: "Do you like pizza?", 2: "Do you like fruit?", } });
	}
	else {
		next();
	}
});

module.exports = router;
