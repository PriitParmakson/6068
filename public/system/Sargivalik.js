/////////////////////////////////////////// Käivitamine
$(function(){

	Parse.$ = jQuery;
	// Rakendus 6068
	Parse.initialize("TvhWFqKT1rJ5dgp4syQkgvUxYBVAE6MrYDDEzs5K",
								 "EwWH4WmSQnQwJF0ZQPqU7eVomhc6PmGJteXtuNJO");
	
	lisaSyndmusekäsitlejad();
	laeSargid();							 
});

//// Särkide laadimine ///////////////////////
function laeSargid() {	
	var SargiMudel = Parse.Object.extend('Sargid');
	var query = new Parse.Query(SargiMudel);
	query.ascending('Nadal');
	query.find({
		success: function(sargid) {
			console.log('Leitud ' + sargid.length + ' särki');
			kuvaSargid(sargid);
		},
		error: function(viga) {
			console.log('Viga: ' + viga.code + ' ' + viga.message);
		}
	});									 
}
		
// Särkide kuvamine
function kuvaSargid(sargid) {
	sargid.forEach(this.kuvaSark);
	
	// Lisa sündmusekäsitlejad
	$('#Tekstid li a').click(function(e) {
		var read = $(this).html().split("/");
		for (var i = 0; i < 3; i++) {
			if (i < read.length) {
				$('#t' + (i + 1).toString()).html(read[i]);
			} else {
				$('#t' + (i + 1).toString()).html('');
			}
				
		}
	});
}
		
// Ühe särgi kuvamine
function kuvaSark(sark) { 
	var a = JSON.stringify(sark);
	var b = JSON.parse(a);
	// console.log('Kuva särk: ' + b.Tekst);
	var sargiKirje = $('<li><a href="#">' +
		' ' + b.Tekst + '</a></li>');
	$('#Tekstid').append(sargiKirje);
	$('#Tekstid').append('<li role="separator" class="divider"></li>');
}						
	
function lisaSyndmusekäsitlejad() {
	// Rippvalikule Teksti värv
	$('#Tekstivarv li a').click(function(e) {
		var varv = $(this).html().match(/#.*/)[0];
		$('#tekst').attr('fill', varv);
	});
	// Rippvalikule Särgi värv
	$('#Sargivarv li a').click(function(e) {
		var varv = $(this).html().match(/#.*/)[0];
		$('#sark').attr('fill', varv);
	});
}	