var express = require('express');
var router = express.Router();

var sounds = ["", "/sounds/city.mp3", "/sounds/concert.mp3", "/sounds/country.mp3", "/sounds/crowd.mp3", "/sounds/dogpark.wav", "/sounds/traffic.wav", "/sounds/siren.wav", "/sounds/park.wav", "/sounds/office.mp3"]

/* GET home page. */
router.get('/', (req, res, next) => {
	res.render('soundsurvey', { sound: sounds[parseInt(req.cookies.eval) + 1] });
});

module.exports = router;
