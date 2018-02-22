var express = require('express');
var router = express.Router();
var iplocation = require('iplocation')
var db = require('../../db.js');
var adminAPI = require('./admin.js');

var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';
var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var roundTable = (process.env.DEBUG) ? 'dev_rounds' : 'prod_rounds';

/* GET home page. */
router.route('/participant')
	.post((req, res, next) => {
		let ip = req.headers['x-forwarded-for'] || 
			req.connection.remoteAddress || 
			req.socket.remoteAddress ||
			(req.connection.socket ? req.connection.socket.remoteAddress : null);

		if (req.app.get('env') === 'development') ip = '192.76.177.125';

		iplocation(ip, function (error, r) {
			let location;
			if (!error) location = r.city + " " + r.country_code;
			else location = "unavailable";

			const data = {
				gender: req.body.gender,
				experience: req.body.experience,
				goal: req.body.plan,
				age: req.body.age,
				ip: ip,
				location: location
			};

			db(userTable).returning('id').insert(data)
				.then((id) => {
					var dt = new Date();
					var utcDate = dt.toUTCString();
					const nData = {
						userid: parseInt(id),
						start: utcDate,
						"total_sort": 0,
						"total_filter": 0,
						"total_return": "0",
					};
					return db(testTable).returning(['id', 'userid']).insert(nData);
				})
				.then((data) => {
					console.log(data[0].id);
					res.cookie('test', data[0].id, { maxAge : 8.64e7 });
					res.cookie('user', data[0].userid, { maxAge : 8.64e7 });
					res.json(data);
				});
		});

	});

router.route('/endsurvey')
	.post((req, res, next) => {
		let data = req.body;
		var dt = new Date();
		var utcDate = dt.toUTCString();
		data.ending = utcDate;
		db(testTable).update(data, "id").where('id', req.cookies.test)
			.then((dk) => res.send("success"))			
	});

router.route('/round')
	.get((req, res, next) => {
		res.send("Go");
	})
	.post((req, res, next) => {
		let data = req.body;
		var dt = new Date();
		var utcDate = dt.toUTCString();
		data.ending = utcDate;
		db(roundTable).returning('id').insert(data).then((d) => {
			return db(testTable).select(['total_sort', 'total_filter', 'total_return']).where('id', data.test);
		})
		.then((dj) => {
			var sortN = 0, filterN = 0;
			var c = data.selection.split(':');
			for (var i = 0; i < 5; ++i) {
				if (c[i] !== '') {
					sortN += c[i].split(',').length - 1;
				}
			}
			// Remove filtering
			// for (var i = 5; i < data.selection.length; ++i) {
			// 	if (data.selection[i] != '0') ++filterN; 
			// }
			return db(testTable).update({'total_sort': dj[0]['total_sort'] + sortN, 'total_filter': dj[0]['total_filter'] + filterN, 'total_return': parseFloat(dj[0]['total_return']) + parseFloat(data.return) + ''}).where('id', data.test);
		})
		.then((dk) => res.send("success"))			
	});

router.use('/admin', adminAPI);

module.exports = router;
