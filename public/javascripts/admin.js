var curr = 1;
function d() { download(csv, "hello.csv", "text/csv"); }
function nextRoundA() {
	++curr;
	if (curr > 10) curr = 10;
	$('#round1').text("ROUND " + curr);
	$('.inputs > tbody > tr').show();	
	$('.inputs > tbody > tr').not('.round'+curr).hide();
}
function prevRoundA() {
	--curr;
	if (curr < 1) curr = 1;
	$('#round1').text("ROUND " + curr);
	$('.inputs > tbody > tr').show();
	$('.inputs > tbody > tr').not('.round'+curr).hide();
}
function nextRound() {
	++curr;
	if (curr > 10) curr = 10;
	$('#round').text("ROUND " + curr);
	$('.pushes > tbody > tr').show();	
	$('.pushes > tbody > tr').not('.round'+curr).hide();
}
function prevRound() {
	--curr;
	if (curr < 1) curr = 1;
	$('#round').text("ROUND " + curr);
	$('.pushes > tbody > tr').show();
	$('.pushes > tbody > tr').not('.round'+curr).hide();
}
function saveValues() {
	var data = {};
	$('.inputs > tbody > tr > td > input').each(function(index) {
		if ($(this).val()) {
			var round = $(this).parent().parent().attr('class').replace("round", "");
			var name = $(this).attr("data-name");//parent().parent().find(":first-child").text();
			var val = $(this).val();
			if (!data[round - 1]) data[round - 1] = {};
			data[round - 1][name] = val;
		}
	});
	$.post('/api/admin/values', { data: JSON.stringify(data) }, function(response) {
		if (response === 'success')	alert('Saved it!');
		else alert('Something went wrong...');
	});
}
function savePercentages() {
	var data = {};
	$('.pushes > tbody > tr > td > input').each(function(index) {
		if ($(this).val()) {
			var round = $(this).parent().parent().attr('class').replace("round", "");
			var name = $(this).parent().parent().find(":first-child").attr('class');
			var val = parseInt($(this).val());
			if (!data[round]) data[round] = {};
			data[round][name] = val;
		}
	});
	$.each(data, function(index, val) {
		var max = 0;
		$.each(data[index], function(i, v) {
			if (max < parseInt(data[index][i])) {
				max = parseInt(data[index][i]);
			}
		})
		data[index]['sort-max'] = max;
	});
	$.post('/api/admin/percentages', { data: JSON.stringify(data) }, function(response) {				
		if (response === 'success')	alert('Saved it!');
		else alert('Something went wrong...');
	});
}
function saveQuestions() {
	var data = {};
	$('.questioninput').each(function (index) {
		if ($(this).val()) {
			data[index] = $(this).val();
		}
	});
	$.post('/api/admin/questions', data, function() {
		alert('Saved!');
	});
}
function bonus(amount, id, ass) {
	amount = Math.round(amount) / 100; 
	var c = confirm('CONFIRM Bonus of $' + amount + ' for worker ' + id);
	if (c) {
		$.ajax({
		  type: "POST",
		  url: '/api/admin/bonus',
		  data: { worker: id, amount: amount, ass: ass},
		  success: function(data) {
		  		if (data == 'success') alert('Bonused');
		  		else alert('User was already bonused');
			},
		  error: function() {
				alert('User was already bonused');
			}
		});
	}
}