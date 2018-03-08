const fs = require('fs');

const args = process.argv;
let path, folder;

let counter = 0;

for (let i = 0; i < args.length; ++i) {
	if (args[i] == '-f') {
		path = args[i + 1];
	}
	else if (args[i] == '-d') {
		folder = args[i + 1];
	}
}

if (path) {
	if (path.includes('.mbox')) {
		const emails = readMBOX(path);
		for (let i = 0; i < emails.length; ++i) {
			prepareEmail(emails[i]);
		}
	}
	else {
		const file = fs.readFileSync(path, 'utf-8');
		prepareEmail(file)
	}
	// const file = fs.readFileSync(path);
	// console.log(file[34]);
}
else if (folder) {
	const fileNames = fs.readdir(folder, function(err, items) {
		if (!err) {
			for (let i = 0; i < items.length; ++i) {
				const file = fs.readFileSync(folder + '/' + items[i], 'utf-8');
			}
		}
		else {
			console.error('no');
		}
	})
}

function readMBOX (mbox) {
	let output = [];
	let searchIndex = 0;
	const file = fs.readFileSync(mbox, 'utf-8');
	while(file.indexOf('<html>', searchIndex) > -1) {
		let start = file.indexOf('<html>', searchIndex);
		let end = file.indexOf('</html>', start);
		searchIndex = end;
		output.push(file.substring(start, end + 7));
	}
	return output;
}

function prepareEmail (email) {
	email = email.replace(new RegExp('=\r\n', 'g'), '');
	email = email.replace(new RegExp('=3D', 'g'), '=');
	email = email.replace(new RegExp('=09', 'g'), '');
	email = email.replace(new RegExp('\t', 'g'), '');
	email = email.replace(new RegExp('\n', 'g'), '');
	email = email.replace(new RegExp('\r', 'g'), '');
	email = email.replace(new RegExp('=20', 'g'), '');
	email = email.replace(new RegExp('=C2=A9', 'g'), '&copy;');
	email = email.replace(new RegExp('=C2=A0', 'g'), '&nbsp;');
	email = email.replace(new RegExp('"', 'g'), '\\"');
	counter++;
	fs.writeFile(__dirname + '/data/emailsRaw/email_' + counter + '.txt', email, function(err) {
		if (err) console.error(err);
		else console.log('File written');
	});
}
