var timelimit = 30;
var timelimit2 = 3;
var timer;
var links = document.querySelectorAll('a');
var linkTimer = null;
var l = [];
var startmillis;

function countdown() {
	timelimit--;
	document.querySelector('#seconds').innerHTML = timelimit;
	if (timelimit) {
		timer = setTimeout(countdown, 1000);
	}
	else {
		document.querySelector('#bottombar').style.top = 0;
		document.querySelector('#instructions').style.display = "none";
		document.querySelector('#timeleft').style.display = "none";
	}
}

function countdown2() {
	timelimit2--;
	document.querySelector('#wait').innerHTML = timelimit2;
	if (timelimit2) {
		timer = setTimeout(countdown2, 1000);
	}
	else {
		document.querySelector('#waitbar').style.top = '100%';
		timer = setTimeout(countdown, 1000);
		startmillis = new Date().getTime();
	}
}

timer = setTimeout(countdown2, 1000);

var show = function() {
	document.querySelector('#info-box').style.display = "block";
	document.querySelector('#moreInfo').removeEventListener('click', show);
	setTimeout(() => {
		document.querySelector('#moreInfo').addEventListener('click', hide);
		document.addEventListener('click', hide);
	}, 200);
}

var hide = function() {
	document.querySelector('#moreInfo').removeEventListener('click', hide);
	document.removeEventListener('click', hide);
	document.querySelector('#info-box').style.display = "none";
	setTimeout(() => {
		document.querySelector('#moreInfo').addEventListener('click', show);
	}, 200)
}

document.querySelector('#moreInfo').addEventListener('click', show)
document.querySelector('#instructions').addEventListener('click', function() {
	document.querySelector('#bottombar').style.bottom = '100%';
	document.querySelector('#bottombar').style.top = '-90%';

	document.querySelector('#bottominstr').style.bottom = '0';
	document.querySelector('#bottominstr').style.top = '0';
	document.getElementById('audio').pause();

	window.clearTimeout(timer);
})
document.querySelector('#resume').addEventListener('click', function() {
	document.querySelector('#bottombar').style.bottom = '0';
	document.querySelector('#bottombar').style.top = '90%';

	document.querySelector('#bottominstr').style.bottom = '-100%';
	document.querySelector('#bottominstr').style.top = '100%';

	document.getElementById('audio').play();
	timer = setTimeout(countdown, 1000);
})

document.querySelector('#round').innerHTML = $.cookie('round');

function next(selection) {
	// Alter sound cookie to record played sound
	var soundCookie = $.cookie('sound');
	soundCookie = soundCookie.substr(0, soundNum) + (parseInt(soundCookie[soundNum]) + 1) + "" + soundCookie.substr(soundNum + 1);

	// Alter email cookie to record seen emails
	var emailCookie = $.cookie('emails');
	emailCookie |= Math.pow(2, emailIndex);

	$.cookie('round', parseInt($.cookie('round')) + 1 + '', { expires: 7, path: '/' });	
	$.cookie('sound', soundCookie, { expires: 7, path: '/' });	
	$.cookie('emails', emailCookie, { expires: 7, path: '/' });	

	let data = {
		sound: sound,
		'email_index': emailIndex,
		selection: selection,
		scenario: $.cookie('scenario'),
		testid: $.cookie('test'),
		start: start,
		'links_clicked': JSON.stringify(l)
	}

	$.post('/api/round', data, function() { window.location = '/study'; });
	//window.location='/study';
}

for (let i = 0; i < links.length; ++i) {
	l.push({ clicks: [], hover: []})
	links[i].addEventListener('click', (e) => {
		l[i].clicks.push((new Date().getTime() - startmillis) / 1000);
		e.preventDefault();
	});
	links[i].addEventListener('mouseover', () => {
		linkTimer = setTimeout(() => {
			l[i].hover.push((new Date().getTime() - startmillis) / 1000);
		}, 500);
	})
	links[i].addEventListener('mouseout', () => {
		clearTimeout(linkTimer);
	})
}
