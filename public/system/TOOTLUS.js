
// Globaalsed olekumuutujad
var
	jArtikkel = 'Tutvustus.md', // Parajasti laetud või redigeeritav artikkel (href e Nimi)
	jArtikkelObjekt, // Parse-st laetud artikkel: {"Nimi":... Tekst:... objectId...}
	jArtikkelSenine, // Tagasipööramise juhuks
	redaktorSees = false,
	currentUser // Autenditud kasutaja
	;

/////////////////////////////////////////// Käivitamine
$(function(){

	Parse.$ = jQuery;
	// Rakendus 6068
	Parse.initialize("TvhWFqKT1rJ5dgp4syQkgvUxYBVAE6MrYDDEzs5K",
								 "EwWH4WmSQnQwJF0ZQPqU7eVomhc6PmGJteXtuNJO");

	// Ülamenüü laadimine Parse							 
	var ArtikliMudel = Parse.Object.extend('Artikkel');
	var query = new Parse.Query(ArtikliMudel);
	query.equalTo('Nimi', 'Ulamenuu.html');
	var self = this; // Sest anonüümses funktsioonis kontekst muutub
	query.find({
		success: function(artiklid) {
			// Saadeti array, mille elemendid on objektid struktuuriga:
			// {"Nimi":... Tekst:... objectId...}
			if (artiklid.length === 0) {
				console.log('Ülamenüüd ei leitud Parse-s');
			} else {
				var a = JSON.stringify(artiklid[0]);
				var b = JSON.parse(a);
				// Siia võib lisada ülamenüü töötluse
				$('#ylamenyy').html(b.Tekst);
				// Lisada ülamenüü enda kuvamine/redigeerimine
				if (Parse.User.current()) { 
					var lisa = "<li><a href='Ulamenuu.html' target='_new'>Ülamenüü</a></li>";
					$('#Arendus').append(lisa);				
				}
				seaYlamenyySyndmusekasitlejad();
				SeaAutentimisala();
				laeEsimeneArtikkel();		
			}
		},
		error: function(viga) {
			console.log('Viga ülamenüü laadimisel: ' + viga.code + ' ' + viga.message);
		}
	});
	
	// Ülamenüü laadimine. jQuery load on asünk
	// $('#ylamenyy').load('system/Ulamenuu.html', function() {
	// 	seaYlamenyySyndmusekasitlejad();
	// 	SeaAutentimisala();
	// 	laeEsimeneArtikkel();		
	// });

}); /////////////////////////////////////////	

function SeaAutentimisala() {
	
	// Kuva kasutajanimi (kui on) ja sea Logi sisse/välja nupp
	if (Parse.User.current()) { 
		// Kasutaja on varasemast sisse logitud
		// Kuva kasutaja nimi
		var a = JSON.stringify(Parse.User.current());
		var b = JSON.parse(a);
		console.log('Kasutaja: ' + b.username);
		$('#autentimisala .kasutajanimi').text(b.username);
		
		// Kuva väljalogimise nupp
		$('#autentimisala .logiNupp').text('Logi välja');
		// Kuva redaktorinupp
		$('.redaktoriNupp').show();

	} else {
		// Kuva sisselogimise nupp
		$('#autentimisala .logiNupp').text('Logi sisse');
		// Peida redaktorinupp
		$('.redaktoriNupp').hide();
		
	};
	
	// Sündmusekäsitleja Logi sisse/välja nupule
	$('#autentimisala .logiNupp').click(function(event) {
		event.preventDefault();
		
		if (Parse.User.current()) {
			// Logi välja
			Parse.User.logOut();
			$('.kasutajanimi').text('');
			$('#autentimisala .logiNupp').text('Logi sisse');
			// Peida redaktorinupp
			$('.redaktoriNupp').hide();
		} else {
			// Logi sisse (ava sisenemisvorm)
			$('#autentimisala .logiNupp').addClass('hidden');
			$('#autentimisala form').toggle();
			$('#autentimisala .sisene').focus();
		}				
	});
	
	// Sündmusekäsitlejad sisenemisvormi Sisene nupule
	$('#autentimisala .sisene').click(function(event) {
		event.preventDefault();
		
		// Võta kasutajanimi ja salasõna vormilt
		var kasutajanimi = $('#login-username').val();
		var salasona = $('#login-password').val();

		// Tee login Parse-s
		Parse.User.logIn(kasutajanimi, salasona, {
			success: function(user) {
				var a = JSON.stringify(user);
				var b = JSON.parse(a);
				console.log(b.username + ' logis sisse');
				// Kuva kasutaja nimi
				$('#autentimisala .kasutajanimi').text(b.username);
				// Sulge sisenemisvorm
				$('#autentimisala form').toggle();
				// Muuda Logi sisse/välja nupp
				$('#autentimisala .logiNupp').text('Logi välja');
				$('#autentimisala .logiNupp').removeClass('hidden');
				// Kuva redaktorinupp
				$('.redaktoriNupp').show();
			},
			error: function(user, error) {
				// Kuva veateade
				$("#autentimisala .VEATEADE").html("Vale nimi või salasõna.").show();
			}
		});
		
	});

	// Sündmusekäsitleja sisenemisvormi Katkesta nupule
	$('#autentimisala .katkesta').click(function(event) {
		event.preventDefault();
		// Sule vorm
		$('#autentimisala form').toggle();
		$('#autentimisala .logiNupp').removeClass('hidden');
	});
	
}
	
// Kuvab artikli, globaalsete muutujate jArtikkel ja jArtikkelObjekt põhjal 
// Vajadusel teisendab Markdown-i HTML-ks (.html .md alusel)
// Moodusta ka külgmenüü
function kuvaArtikkel() {
	// Markdown-i korral teisenda HTML-ks
	var
		filetype = jArtikkel.split('.').pop(),
		htmlTekst;
	switch (filetype) {
		case 'html': // Teisendus pole vajalik
			htmlTekst = jArtikkelObjekt.Tekst;
			break;
		case 'md': // Teisenda HTML-ks
			// htmlTekst = marked(jArtikkelObjekt.Tekst);
			var md = new Remarkable({
				html: true, // Enable HTML tags in source
			});
			htmlTekst = md.render(jArtikkelObjekt.Tekst);
			break;
		default:
			console.log('Viga: Kuvatav fail ei ole .html ega .md');
			// Pööra tagasi
			jArtikkel = jArtikkelSenine;
			return
	}

	$('article').first().html(htmlTekst);
	koostaKylgmenyy();			
	
}

// Lae artikkel Parse-st
function laeArtikkel(href) {
	// Optimistlikult eeldame, et artikli laadimine ja kuvamine õnnestub
	// Tagasipööramiseks salvestame siiski jArtikkel ja jArtikkelObjekt väärtused
	jArtikkelSenine = jArtikkel;
	jArtikkel = href;
	var ArtikliMudel = Parse.Object.extend('Artikkel');
	var query = new Parse.Query(ArtikliMudel);
	query.equalTo('Nimi', href);
	var self = this; // Sest anonüümses funktsioonis kontekst muutub
	query.find({
		success: function(artiklid) {
			// console.log('Leitud ' + artiklid.length + ' artiklit');
			// Saadeti array, mille elemendid on objektid struktuuriga:
			// {"Nimi":... Tekst:... objectId...}
			if (artiklid.length === 0) {
				console.log('Artiklit ' + jArtikkel + ' ei leitud Parse-s');
				// Pööra tagasi
				jArtikkel = jArtikkelSenine;
			} else {
				var a = JSON.stringify(artiklid[0]);
				jArtikkelObjekt = JSON.parse(a);
				kuvaArtikkel();
			}
		},
		error: function(viga) {
			console.log('Viga: ' + viga.code + ' ' + viga.message);
			// Pööra tagasi
			jArtikkel = jArtikkelSenine;
		}
	});
}

// Salvesta artikkel
function salvestaArtikkel() {
	var ArtikliMudel = Parse.Object.extend('Artikkel');
	var query = new Parse.Query(ArtikliMudel);
	var artikliId = jArtikkelObjekt.objectId;
	var uusTekst = $('#sisestusala').val();
	console.log('Salvestan artiklit: ' + artikliId);
	query.get(artikliId, {
		success: function(artikkel) {
			artikkel.set('Tekst', uusTekst);
			artikkel.save(null, {
				success: function(artikkel) {
					console.log('Artikkel salvestatud');
					// Uuenda globaalseid muutujaid
					jArtikkelObjekt = JSON.parse(JSON.stringify(artikkel));
					// Kuva salvestatud artikkel
					kuvaArtikkel();
					lahkuRedaktorist();
				},
				error: function(sooritus, error) {
					console.log('Viga salvestamisel (' + error.message + ')');
				}
			});
		},
		error: function(artikkel, error) {
			console.log('Viga: ülekirjutatav artikkel on Parse-st kadunud (' + error.message + ')');
		}
	});
}

// Abistavad toimingud redaktorist väljumisel
function lahkuRedaktorist() {
		redaktorSees = false;
		$('#ylamenyy .redaktoriNupp a').removeClass('sees').blur();	
}

// Sea ülamenüü sündmusekäsitlejad
function seaYlamenyySyndmusekasitlejad() {

	// Sündmusekäsitlejad seatakse dropdown-des, millel on klass 'artiklid'
	// NB! Tundlik ülamenüü struktuuri suhtes
	$('#ylamenyy .artiklid .dropdown-menu a').on("click", function(event){
		// Tõkesta lehe standardne laadimine
		event.preventDefault();

		// Toimingud redaktori seesolemise korral
		if (redaktorSees) {
			$('#TEABETEADE').html('Salvestage või katkestage redigeerimine');
			$('#TEABEBLOKK').removeClass('hidden');
			return
		}
		
		// Lae artikkel
		var href= $(this).attr('href');
		laeArtikkel(href);
	});

	// Redaktorinupu sündmusekäsitleja
	$('#ylamenyy .redaktoriNupp a').on("click", function(event) {
		// Tõkesta lehe standardne laadimine
		event.preventDefault();
		
		// Autenditud kasutaja korral ava kuvatud artikkel redigeerimiseks
		// Anonüümse kasutaja korral ava redaktor sõnumi saatmiseks
		
		var currentUser = Parse.User.current();
		if (currentUser) { // Autenditud kasutaja 
			if (redaktorSees) {
				// Redaktorist väljumine ainult katkesta nupuga
				$('#TEABETEADE').html('Salvestage või katkestage redigeerimine');
				$('#TEABEBLOKK').removeClass('hidden');
				$(this).parent().blur();
				return
			} else {
				// Lae redaktor
				var href = $(this).attr('href');
				$('article').first().load(href, function() {
					// Külgmenüü tühjendamine
					$('#sidebar').html('');
					// Alustavad toimingud redaktoris
					// Lae artikkel sisestusalasse
					$('#sisestusala').val(jArtikkelObjekt.Tekst);
					$('#sisestusala').focus();
					seaRedaktoriSyndmusekasitlejad();
				}); 
				redaktorSees = true;
				$(this).parent().addClass('sees');			
			}		

		} else { // Anonüümne kasutaja
			if (redaktorSees) {
				// Redaktorist väljumine ainult katkesta nupuga
				$('#TEABETEADE').html('Saatke teade või katkestage redigeerimine');
				$('#TEABEBLOKK').removeClass('hidden');
				$(this).parent().blur();
				return
			} else {
				// Lae redaktor
				var href = $(this).attr('href');
				$('article').first().load(href, function() {
					// Külgmenüü tühjendamine
					$('#sidebar').html('');
					// Alustavad toimingud redaktoris
					// Tühjenda sisestusala
					$('#sisestusala').val();
					$('#sisestusala').focus();
					seaRedaktoriSyndmusekasitlejad();
				}); 
				redaktorSees = true;
				$(this).parent().addClass('sees');			
			}		

		}		
		
	});
	
}

// Sündmusekäsitlejad Redaktori nuppudele
function seaRedaktoriSyndmusekasitlejad() {
	$('#salvestaNupp').on('click', function(event) {
		// Tõkesta lehe standardne laadimine
		event.preventDefault();

		// Asünkroonsuse tõttu kõik tegevused järgnevas funktsioonis
		salvestaArtikkel();
	});
	
	$('#katkestaNupp').on('click', function(event) {
		// Tõkesta lehe standardne laadimine
		event.preventDefault();

		lahkuRedaktorist();
		kuvaArtikkel();
	});

}

// Lae esimene artikkel
function laeEsimeneArtikkel() {
	var href = 'Tutvustus.html'; // Failide variandis: 'K/Tutvustus.html'
	laeArtikkel(jArtikkel);
	/* -------- Failidena salvestamise variant --------
	$('article').first().load(href, function() {
		// Koosta külgmenüü
		koostaKylgmenyy();
	}); 
	--------*/
}

// Külgmenüü moodustamine
function koostaKylgmenyy() {
  // Vt https://github.com/mistic100/jekyll-bootstrap-doc/blob/gh-pages/assets/js/docs.min.js
	// Korjab article-test h2-d, lisab neile id-d mustriga j*
	// ja täidab külgmenüü li-elementidega.
	// Külgmenuu ul-elemendi id on #sidebar.
	
  var html = '';

  $('article').each(function() {
    var h2 = $(this).find('h2');

		if (h2.length) {
			h2.each(function(index, value) {
				// Moodusta id mustriga j*
				var id = 'j' + index;
				$(this).attr('id', id)
				html+= '<li><a href="#' + id +'">'+ $(this).text() +'</a></li>';
			});
		}

  });

	$('#sidebar').html(html); 
}