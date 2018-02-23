var timer = 5;

function countdown () {
	timer--;
	document.querySelector('#start').innerHTML = timer;
	if (timer) {
		setTimeout(countdown, 1000);
	}
	else {
		document.querySelector('#start').innerHTML = 'Continue';
	}
}

function continueStudy() {
	if (timer < 1) {
		$.cookie('round', parseInt($.cookie('round')) + 1 + '', { expires: 7, path: '/' });	
		window.location='/study';
	}
}

setTimeout(countdown, 1000);

// var countdown = function() {
// 	timer--;
// 	document.querySelector('#start').innerHTML = timer;
// 	if (timer) {
// 		setTimeout(countdown, 1000);
// 	}
// 	else {
// 		document.querySelector('#start').innerHTML = 'Continue';
// 	}
// };

// var continue = function() {
// 	if (timer < 1) {
// 		$.cookie('round', parseInt($.cookie('round')) + 1 + '', { expires: 7, path: '/' });	
// 		window.location='/survey';
// 	}
// }
// setTimeout(countdown, 1000);