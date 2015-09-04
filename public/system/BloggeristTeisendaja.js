
/////////////////////////////////////////// Käivitamine
$(function(){

	var
		regexp,
		puhas;

	Parse.$ = jQuery;
	// Rakendus 6068
	Parse.initialize("TvhWFqKT1rJ5dgp4syQkgvUxYBVAE6MrYDDEzs5K",
								 "EwWH4WmSQnQwJF0ZQPqU7eVomhc6PmGJteXtuNJO");

	SeaAutentimisala();
								 
	// Puhasta
	$('#alaMarkdown').val('');						
						
	// Sündmusekäsitleja Teisenda nupule
	$('#teisendaNupp').click(function(event) {
		event.preventDefault();

		// optional options w/defaults
		var options = {
			link_list:  false,    // render links as references, create link list as appendix
			h1_setext:  false,     // underline h1 headers
			h2_setext:  false,     // underline h2 headers
			h_atx_suf:  false,    // header suffixes (###)
			gfm_code:   "```",    // gfm code blocks
			trim_code:  true,     // trim whitespace within <pre><code> blocks (full block, not per line)
			li_bullet:  "*",      // list item bullet style
			hr_char:    "-",      // hr style
			indnt_str:  "    ",   // indentation string
			bold_char:  "*",      // char used for strong
			emph_char:  "_",      // char used for em
			gfm_del:    true,     // ~~strikeout~~ for <del>strikeout</del>
			gfm_tbls:   true,     // markdown-extra tables
			tbl_edges:  false,    // show side edges on tables
			hash_lnks:  false,    // anchors w/hash hrefs as links
			br_only:    false,    // avoid using "  " as line break indicator
			col_pre:    "col ",   // column prefix to use when creating missing headers for tables
			nbsp_spc:   false,    // convert &nbsp; entities in html to regular spaces
			span_tags:  true,     // output spans (ambiguous) using html tags
			div_tags:   true,     // output divs (ambiguous) using html tags
			unsup_tags: {         // handling of unsupported tags, defined in terms of desired output style. if not listed, output = outerHTML
					// no output
					ignore: "script style noscript",
					// eg: "<tag>some content</tag>"
					inline: "span sup sub i u b center big",
					// eg: "\n\n<tag>\n\tsome content\n</tag>"
					block2: "div form fieldset dl header footer address article aside figure hgroup section",
					// eg: "\n<tag>some content</tag>"
					block1c: "dt dd caption legend figcaption output",
					// eg: "\n\n<tag>some content</tag>"
					block2c: "canvas audio video iframe"
			},
			tag_remap: {          // remap of variants or deprecated tags to internal classes
					"i": "em",
					"b": "strong"
			}
		};
		
		// Kanna Blogger ala sisu abielementi
		var Blogger = $('#alaBlogger').val();		
		$('#abi').html(Blogger);

		// Teisenda 
		var reMarker = new reMarked(options);
		var markdown = reMarker.render(document.getElementById('abi'));
	
		// Eemalda abielemendi div
		puhas = markdown.substring(markdown.indexOf('>') + 1, markdown.lastIndexOf('<') - 1);
	
		// Asenda iga reavahetus kahega 
		puhas = puhas.replace(/\n/g, '\n\n');

		// Kustuta liigsed reavahetused
		for (var i = 0; i < 4; i++) {
			puhas = puhas.replace(/\n\n\n/g, '\n\n');			
		}
		
		// h2, h4 -> h1, h2
		puhas = puhas.replace(/##([^#])/g, '#$1');
		puhas = puhas.replace(/###/g, '##');
		
		// 4 tühikut (rea alguses) (koodi tähis) eemaldada
		puhas = puhas.replace(/ {4}/g, '');
		
		// Asenda &nbsp; tühikuga
		puhas = puhas.replace(/&nbsp;/g, ' ');
		
		// Kustuta Bloggeri dokumendisisesed viited
		// Leia tühi nurksulupaar, millele järgneb ümarsulgudes tekst - ja kustuta see
		regexp = /\[\]\([^)]*\)/ig;
		puhas = puhas.replace(regexp, '');
		
		// Teisenda joonised
		
		// Eemalda [![] ja [!]
		regexp = /\[!\[?\]/ig;
		puhas = puhas.replace(regexp, '');
		
		// Eralda style="clear: both; text-align: center;" class="separator"
		// regexp = / style="clear: both; text-align: center;" class="separator"/ig;
		// puhas = puhas.replace(regexp, '');		
		
		// <div> ... </div>
		// vahelt esimeses ümarsulgudes olev URL, pane selle ette ![]
		// Tagasiviited vt http://techbrij.com/javascript-backreferences-string-replace-regex
		regexp = /(<div style="clear: both; text-align: center;" class="separator">(\([^\)]+\)).*<\/div>)/ig;
		puhas = puhas.replace(regexp, '![]$2');
		
		// http > https
		puhas = puhas.replace(/http:/g, 'https:');
		
		$('#alaMarkdown').val(puhas);	
		
	});

	// Sündmusekäsitleja Salvesta nupule
	$('#salvestaNupp').click(function(event) {
		event.preventDefault();

		var artikliNimi = $('#ArtikliNimi').val();
		if (artikliNimi.length == 0) {
			alert('Sisesta artikli nimi (tüüp .md)');
			$('#TEABETEADE').html('Sisesta artikli nimi (tüüp .md)');
			$('#TEABEBLOKK').removeClass('hidden');
			return
		}
		
		// Salvestamiseks peab olema rakendusse 6068 sisse logitud
		// See on seatud Parse-s juurdepääsuõigusega
		var ArtikliMudel = Parse.Object.extend('Artikkel');
		var artikkel = new ArtikliMudel();
		
		artikkel.set('Nimi', artikliNimi);
		artikkel.set('Tekst', $('#alaMarkdown').val());
		
		artikkel.save(null, {
			success: function(artikkel) {
				console.log('Artikkel ' + artikkel.id + ' salvestatud');
				$('#EDUTEADE').html('Artikkel ' + artikkel.id + ' salvestatud');
				$('#EDUBLOKK').removeClass('hidden');
			},
			error: function(artikkel, error) {
				console.log('Viga salvestamisel ' + error.message);
				$('#VEATEADE').html('Viga salvestamisel ' + error.message);
				$('#VEABLOKK').removeClass('hidden');
			}
		});
		
	});
		
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
		} else {
			// Kuva sisselogimise nupp
			$('#autentimisala .logiNupp').text('Logi sisse');
		};
		
		// Sündmusekäsitleja Logi sisse/välja nupule
		$('#autentimisala .logiNupp').click(function(event) {
			event.preventDefault();
			
			if (Parse.User.current()) {
				// Logi välja
				Parse.User.logOut();
				$('.kasutajanimi').text('');
				$('#autentimisala .logiNupp').text('Logi sisse');
			} else {
				// Logi sisse (ava sisenemisvorm)
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
		});
		
	}
		
}); /////////////////////////////////////////	

