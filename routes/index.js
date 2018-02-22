var express = require('express');
var router = express.Router();

const admin = require('./admin.js');
const study = require('./study.js');
const survey = require('./survey.js');
const welcome = require('./welcome.js');
const endsurvey = require('./endsurvey.js');
const result = require('./result.js');
const api = require('./api/');

router.use('/api', api);

router.use('/admin', admin);
router.use('/study', study);
router.use('/survey', survey);
router.use('/endsurvey', endsurvey);
router.use('/result', result);
router.use('/', welcome);

module.exports = router;
