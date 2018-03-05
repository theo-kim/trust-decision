var timelimit = 45;
var timelimit2 = 2;
var timer;

function countdown() {
	timelimit--;
	document.querySelector('#seconds').innerHTML = timelimit;
	if (timelimit) {
		timer = setTimeout(countdown, 1000);
	}
	else {
		document.querySelector('#bottombar').style.top = 0;
		document.querySelector('#instructions').style.display = "none";
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
	document.querySelector('#bottombar').style.top = '-70%';

	document.querySelector('#bottominstr').style.bottom = '0';
	document.querySelector('#bottominstr').style.top = '0';

	window.clearTimeout(timer);
})
document.querySelector('#resume').addEventListener('click', function() {
	document.querySelector('#bottombar').style.bottom = '0';
	document.querySelector('#bottombar').style.top = '70%';

	document.querySelector('#bottominstr').style.bottom = '-100%';
	document.querySelector('#bottominstr').style.top = '100%';


	timer = setTimeout(countdown, 1000);
})

function next() {
	// Alter sound cookie to record played sound
	var soundCookie = $.cookie('sound');
	soundCookie = soundCookie.substr(0, soundNum) + (parseInt(soundCookie[soundNum]) + 1) + "" + soundCookie.substr(soundNum + 1);

	$.cookie('round', parseInt($.cookie('round')) + 1 + '', { expires: 7, path: '/' });	
	$.cookie('sound', soundCookie, { expires: 7, path: '/' });	
	window.location='/study';
}

const links = document.querySelectorAll('a');

for (let i = 0; i < links.length; ++i) {
	links[i].addEventListener('click', (e) => {
		e.preventDefault();
	})
}

// // Utility function
// Array.prototype.remove = function() {
//     var what, a = arguments, L = a.length, ax;
//     while (L && this.length) {
//         what = a[--L];
//         while ((ax = this.indexOf(what)) !== -1) {
//             this.splice(ax, 1);
//         }
//     }
//     return this;
// };

// var usedSorts = {
// 	category: { a: [], d: [] },
// 	fee: { a: [], d: [] },
// 	price: { a: [], d: [] },
// 	"first-year": { a: [], d: [] },
// 	"fifth-year": { a: [], d: [] }
// }

// var usedFilters = {
// 	stock: false,
// 	bond: false,
// 	"money-market": false,
// 	balanced: false,
// 	international: false,
// 	index: false,
// 	active: false,
// 	above: false,
// 	between: false,
// 	below: false
// }

// var ref = {
// 	category: 0,
// 	fee: 1,
// 	price: 2,
// 	"first-year": 3,
// 	"fifth-year": 4,
// 	stock: 5,
// 	bond: 6,
// 	"money-market": 7,
// 	balanced: 8,
// 	international: 9,
// 	index: 10,
// 	active: 11,
// 	above: 12,
// 	between: 13,
// 	below: 14
// }

// function next(e) {
// 	let allocation = "";
// 	let returns = 0;
// 	$.each($('.allocation'), function(i, item) {
// 		if (item.value) {
// 			allocation += item.getAttribute('data-extra') + ":" + item.value + ", ";
// 			returns += parseFloat(item.getAttribute('data-return')) * (item.value / 100);
// 		}
// 	});

// 	returns -= 10;

// 	const s = Object.keys(usedSorts);
// 	const f = Object.keys(usedFilters);
// 	let selection = new Array(s.length + f.length);
// 	console.log(usedSorts);
// 	for (var i = 0; i < s.length; ++i) {
// 		let index = -1
// 		index = ref[s[i]];
// 		selection[index] = "";
// 		for (var j = 0; j < usedSorts[s[i]].a.length; ++j) {
// 			selection[index] += 'a' + usedSorts[s[i]].a[j] + ',';
// 		}
// 		for (var j = 0; j < usedSorts[s[i]].d.length; ++j) {
// 			selection[index] += 'd' + usedSorts[s[i]].d[j] + ',';
// 		}
// 	}
// 	for (var i = 0; i < f.length; ++i) {
// 		let index = -1
// 		index = ref[f[i]];
// 		selection[index] = "";
// 	}
// 	let output = "";
// 	for (var i = 0; i < selection.length; ++i) {
// 		output += selection[i] + ':';
// 	}
// 	console.log(output);
// 	var curr = parseInt($.cookie("round"));
// 	var data = {
// 		type: rand,
// 		test: test,
// 		allocation: allocation,
// 		selection: output,
// 		start: start,
// 		'return': returns + ''
// 	};
// 	$.cookie("round", curr + 1);
// 	$.cookie("return", returns);
// 	$.post('/api/round', data, function() {
// 		location.reload();
// 	});
// }

// function sortTable(index, direction) {
//   var table, rows, switching, i, x, y, shouldSwitch;
//   table = document.getElementById("data").getElementsByTagName("tbody")[0];
//   switching = true;
//   /* Make a loop that will continue until
//   no switching has been done: */
//   var count = 0;
//   while (switching) {
//     // Start by saying: no switching is done:
//     switching = false;
//     rows = table.getElementsByTagName("tr");
//     /* Loop through all table rows (except the
//     first, which contains table headers): */
//     for (i = 0; i < (rows.length - 1); i++) {
//       // Start by saying there should be no switching:
//       shouldSwitch = false;
//       /* Get the two elements you want to compare,
//       one from current row and one from the next: */
//       x = parseFloat(rows[i].getElementsByTagName("td")[index].innerHTML.replace(/[^0-9\.\-]/g,''));
//       y = parseFloat(rows[i + 1].getElementsByTagName("td")[index].innerHTML.replace(/[^0-9\.\-]/g,''));

//       if (rows[i].getElementsByTagName("td")[index].innerHTML.replace(/[^0-9\.]/g,'') != '') {
// 	      // Check if the two rows should switch place:
// 	      if (direction == "asc" && x > y) {
// 	        // I so, mark as a switch and break the loop:
// 	        shouldSwitch= true;
// 	        break;
// 	      }
// 	      if (direction == "desc" && x < y) {
// 	        // I so, mark as a switch and break the loop:
// 	        shouldSwitch= true;
// 	        break;
// 	      }
//       }
//       else {
//       	x = rows[i].getElementsByTagName("td")[index].innerHTML;
//       	y = rows[i + 1].getElementsByTagName("td")[index].innerHTML;
//       	if (direction == "asc" && x.localeCompare(y, undefined, {sensitivity: 'base'}) > 0) {
//       		shouldSwitch= true;
// 	        break;
//       	}
//       	else if (direction == "desc" && x.localeCompare(y, undefined, {sensitivity: 'base'}) < 0) {
//       		shouldSwitch= true;
// 	        break;
//       	}
//       }

//       count++;
//     }
//     if (shouldSwitch) {
//       /* If a switch has been marked, make the switch
//       and mark that a switch has been done: */
//       rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
//       switching = true;
//     }
//   }
// }

// var order = 0;

// function sortAsc(keyword) {
// 	var conve = { "category": 1, "fee": 2, "price": 3, "first-year": 4, "fifth-year": 5};
// 	++order;
// 	usedSorts[keyword].a.push(order);
// 	sortTable(conve[keyword], "asc");
// }

// function sortDesc(keyword) {
// 	var conve = { "category": 1, "fee": 2, "price": 3, "first-year": 4, "fifth-year": 5};
// 	++order;
// 	usedSorts[keyword].d.push(order);
// 	sortTable(conve[keyword], "desc");
// }

// var activeFilter = [];

// function filterTable(col, filter) {
// 	if (activeFilter.includes(filter))
// 		activeFilter.remove(filter);
// 	else
// 		activeFilter.push(filter);

// 	// Declare variables
// 	var table, tr, td, i, flag, fil;
// 	table = document.getElementById("data").getElementsByTagName("tbody")[0];
// 	tr = table.getElementsByTagName("tr");

// 	// Loop through all table rows, and hide those who don't match the search query
	
// 	for (i = 0; i < tr.length; i++) {
// 		td = tr[i].getElementsByTagName("td")[col];
// 		if (td) {
// 			flag = false;
// 			if (activeFilter.length > 0) {
// 				for (var j = 0; j < activeFilter.length; ++j) {
// 					fil = activeFilter[j].toUpperCase();
// 					if (fil === "ACTIVE" && td.innerHTML.toUpperCase().indexOf("INDEX") == -1)
// 						flag = true;
// 					else if (col === 2 && filter === "above" && parseFloat(td.innerHTML) > 0.3)
// 						flag = true;
// 					else if (col === 2 && filter === "below" && parseFloat(td.innerHTML) < 0.1)
// 						flag = true;
// 					else if (col === 2 && filter === "between" && parseFloat(td.innerHTML) < 0.3 && parseFloat(td.innerHTML) > 0.1)
// 						flag = true;
// 					else if (td.innerHTML.toUpperCase().indexOf(fil) > -1)
// 						flag = true;
// 				}
// 				if (flag) tr[i].style.display = "";
// 				else tr[i].style.display = "none";	
// 			}
// 			else tr[i].style.display = "";
// 		}
// 	}
// }

// function filter(e, cat) {
// 	var conv = {
// 		"stock": [1, "Stock"], 
// 		"bond": [1, "Bond"],
// 		"money-market": [1, "Money Market"],
// 		"balanced": [1, "Balanced"],
// 		"international": [1, "International"],
// 		"index": [1, "Index"],
// 		"active": [1, "Active"],
// 		"above": [2, "above"],
// 		"below": [2, "below"],
// 		"between": [2, "between"]
// 	};
// 	usedFilters[cat] = !usedFilters[cat];
// 	filterTable(conv[cat][0], conv[cat][1]);
// }

// $("#next").on('click', function() {
// 	alert("Please allocate 100% of your investment");
// });

// function updateVal(e) {
// 	let sum = 0;
// 	$.each($('.allocation'), function(i, item) {
// 		if (item.value) {
// 			sum += parseInt(item.value);
// 		}
// 	});	
// 	if (sum != 100) {
// 		$("#next").off('click');
// 		$("#next").on('click', function() {
// 			alert("Please allocate 100% of your investment");
// 		});
// 	}
// 	else {
// 		$("#next").off('click');
// 		$("#next").on('click', function() {
// 			next(this);
// 		});	
// 	}

// 	if (sum > 100) {
// 		$("#butt-back").css("background-color", "#CC0000");
// 		$("#next").css("border-color", "#CC0000");
// 	}
// 	else {
// 		$("#butt-back").css("background-color", "#6CC070");
// 		$("#next").css("border-color", "#6CC070");
// 	}
// 	$("#butt-back").css("right", (100 - (sum / 1)) + "%");
// }

// $('[data-toggle="tooltip-visible"]').tooltip('show'); 
// $('[data-toggle="tooltip"]').tooltip(); 