var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round && req.cookies.round > 0) {
		res.render('endsurvey');
	}
	else {
		next();
	}
});

module.exports = router;
