var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	if (!req.cookies.round) { 
		next();
	}
	else {
		if (parseInt(req.cookies.round) < 10) 
			res.render('study');
		else
			res.redirect('/endsurvey');
	}
});

module.exports = router;
