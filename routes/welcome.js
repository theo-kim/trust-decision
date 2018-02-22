var express = require('express');
var router = express.Router();
var welcometext = require('../data/welcometext.json');

/* GET home page. */
router.get('/', (req, res, next) => {
	let min = 0, max = 4;
	const rand = Math.floor(Math.random() * (max - min)) + min;
	res.cookie('round', 1, { maxAge : 8.64e7 });
	res.cookie('rand', rand, { maxAge : 8.64e7 });
	res.cookie('return', 0, { maxAge : 8.64e7 }); 
	res.render('welcome', { text: welcometext[rand] });
});

module.exports = router;
