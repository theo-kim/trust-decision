const mturk = require('mturk-api')
const xml = require("xml-parse")
const csv = require("csv-parse")
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'oldworkers.csv')

var config = {
    access: 'AKIAIM5RDWIKG2R3D2HA',
    secret: '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',
    //real or test
    sandbox: false
}

const contents = fs.readFileSync(filePath, {encoding: 'utf-8'}).split('\r');

mturk.createClient(config).then(function (api) {
    console.log("starting")
	let pagesize = 10;
	const qualification = { 
		Name: "Past Investment Study Participant", 
		Description: "You have completed an investment study HIT in the past", 
		QualificationTypeStatus: "Active" 
	};

	const QualificationId = "37U405KO6B7WABY9J9B0TMFAOKVG3N";

	let promises = [];

	for (let i = 0; i < contents.length; ++i) {
		// console.log(contents[i]);
		promises.push(api.req("AssignQualification", { 
			QualificationTypeId: QualificationId, 
			WorkerId: contents[i]
		}));
	}

	console.log(promises);

	Promise.all(promises).then((res) => console.log('go')).catch(() => console.log('err'))

	// Create Qualification
	// api.req("CreateQualificationType", qualification)
	// 	.then((res) => console.log(res));

	// Search Existing Qualifications
	// api.req("GetQualificationType", { QualificationTypeId: QualificationId })
	// 	.then((res) => console.log(res.QualificationType[0]));	
});