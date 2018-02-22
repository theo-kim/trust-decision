var express = require('express');
var router = express.Router();
var db = require('../db.js');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + s4();

}

var testTable = (process.env.DEBUG) ? 'dev_tests' : 'prod_tests';
var userTable = (process.env.DEBUG) ? 'dev_participants' : 'prod_participants';

/* GET home page. */
router.get('/', (req, res, next) => {
	if (req.cookies.round && req.cookies.round > 0) {
		var usercode = guid();
		db.select([userTable + '.id', 'total_return', 'usercode']).from(testTable).join(userTable, userTable + '.id', testTable + '.userid').where(testTable + '.id', req.cookies.test).first()
			.then((result) => {
				if (!result.usercode) {
					db(userTable).update({'usercode': usercode}).where('id', result.id)
						.then((r) => {
							res.render('result', {total: result.total_return, code: usercode});	
						})
				}
				else res.render('result', {total: result.total_return, code: result.usercode});
			});
	}
	else {
		next();
	}
});

module.exports = router;
