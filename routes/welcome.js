var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

	// Set cookies to be used in the study
	res.cookie('round', 0, { maxAge : 8.64e7 });
	res.cookie('scenario', 0, { maxAge : 8.64e7 });
	res.cookie('sound', '0000000000', { maxAge : 8.64e7 });
	res.cookie('emails', '0', { maxAge : 8.64e7 }); 
	
	// Render welcome page
	res.render('welcome');
});

module.exports = router;
