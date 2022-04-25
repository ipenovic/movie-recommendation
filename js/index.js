var db;
var shortName='Moja baza';
var version='1.0';
var displayName='Moja WebSQL baza';
var maxSize=65535;

var email;
var password;
var userId;

localStorage.clear();

db=openDatabase(shortName, version, displayName, maxSize);

db.transaction(stvoriTablicuKorisnika, errorHandler, sveOk);
db.transaction(stvoriTablicuFilmova, errorHandler, sveOk);
db.transaction(stvoriTablicuLikeova, errorHandler, sveOk);

function stvoriTablicuKorisnika(tx){
	tx.executeSql('CREATE TABLE IF NOT EXISTS Users(UserId INTEGER NOT NULL PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL)', [], sveOk, errorHandler);
}

function stvoriTablicuFilmova(tx){
  tx.executeSql('CREATE TABLE IF NOT EXISTS Movies(MovieId INTEGER NOT NULL PRIMARY KEY, title TEXT NOT NULL, year INTEGER NOT NULL, genre TEXT NOT NULL, description TEXT NOT NULL, likes INTEGER)', [], sveOk, errorHandler);
}

function stvoriTablicuLikeova(tx){
  tx.executeSql('CREATE TABLE IF NOT EXISTS Likes(LikeId INTEGER NOT NULL PRIMARY KEY, UserId INTEGER NOT NULL, MovieID INTEGER NOT NULL, like INTEGER, dislike INTEGER, FOREIGN KEY (UserId) REFERENCES Users (UserId), FOREIGN KEY (MovieId) REFERENCES Movies (MovieId))', [], sveOk, errorHandler);
}

function napuniFilmove(){
  db.transaction(punjenjeTabliceFilmova, errorHandler, sveOk);
}

function sveOk(){

}

function errorHandler(transaction,err){
	alert('Greska: '+err.message+' kod: '+err.code);
}










window.onload=function() {
	//napuniFilmove();
  ucitajFilmove();
  document.getElementById('btnRegistracija').addEventListener('click', registracija);
  document.getElementById('btnPrijava').addEventListener('click', prijava);
  document.getElementById('loadaj').addEventListener('click', napuniFilmove);
  document.getElementById('birisifilmove').addEventListener('click', brisiBazu);
	document.getElementById('preporuka').addEventListener('click', preporuka);
	document.getElementById('odjava').addEventListener('click', odjava);

	if(sessionStorage.getItem("userId") != null){
		username=sessionStorage.getItem('username');
		userId=sessionStorage.getItem('userId');
		document.getElementById('odjava').style.display = "block";
		document.getElementById('prijava').style.display = "none";
		document.getElementById('registracija').style.display = "none";
		document.getElementById('logiranikorisnik').innerHTML = "Korisnik: " + username;
		document.getElementById('loadaj').style.display = "none";
		document.getElementById('birisifilmove').style.display = "none";
		document.getElementById('preporuka').style.display = "block";
	}else {
		document.getElementById('odjava').style.display = "none";
		document.getElementById('prijava').style.display = "block";
		document.getElementById('registracija').style.display = "block";
		document.getElementById('logiranikorisnik').innerHTML = "Filmovi";
		document.getElementById('loadaj').style.display = "block";
		document.getElementById('birisifilmove').style.display = "block";
		document.getElementById('preporuka').style.display = "none";
	}
}

function odjava() {
	sessionStorage.clear();
	window.location="index.html";
	console.log("ocu se odjavit");
}

function preporuka() {
	window.location="preporuka.html";
}










function registracija(){
  document.getElementById('signupmessage').innerHTML = "";
	db.transaction(novaRegistracija, errorHandler, sveOk);
}

function novaRegistracija(t){
	t.executeSql('SELECT * FROM Users', [], obradaRegistracije, neuspjesnaRegistracija);
}

function obradaRegistracije(t, rez){
  username=document.getElementById('usernameR').value;
  email=document.getElementById('emailR').value;
  password=document.getElementById('passwordR').value;

  var korisnikpostoji = false;

  if(rez != null && rez.rows != null){
		for(var i = 0; i<rez.rows.length; i++){
			var podatak = rez.rows.item(i);
      if(podatak.email == email){
        korisnikpostoji = true;
        document.getElementById('signupmessage').innerHTML="Korisnik već postoji!<br><br>";
      }
		}
    if(korisnikpostoji==false){
      document.getElementById('signup').style.display='none';
	  getUserId();
      t.executeSql('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',[username, email, password], sveOk, errorHandler);
			location.reload();
    }
	}
}

function neuspjesnaRegistracija(){
  console.log('Neuspjesna registracija!');
}










function prijava(){
  document.getElementById('loginmessage').innerHTML = "";
	db.transaction(novaPrijava, errorHandler, sveOk);
}

function novaPrijava(t){
	t.executeSql('SELECT * FROM Users', [], obradaPrijave, neuspjesnaPrijava);
}

function obradaPrijave(t, rez){
	console.log(t);
	console.log(rez);
  email=document.getElementById('emailL').value;
  password=document.getElementById('passwordL').value;
	if(rez.rows.length==0) {
		document.getElementById('loginmessage').innerHTML+="Ne postoji takav korisnik!<br><br>";
	}

  if(rez != null && rez.rows != null){
		for(var i = 0; i<rez.rows.length; i++){
			var podatak = rez.rows.item(i);
      if(podatak.email == email && podatak.password == password){
        document.getElementById('login').style.display='none';
        document.getElementById('logiranikorisnik').innerHTML=podatak.username;
				getUserId();
				location.reload();
      }else {
        document.getElementById('loginmessage').innerHTML="Krivo unesen korisnik ili lozinka!<br><br>";
      }
		}
	}
}

function neuspjesnaPrijava(){
  console.log('Neuspjesna prijava!');
}

function getUserId() {
	db.transaction(function(t){t.executeSql('SELECT UserId,username FROM Users WHERE email=? AND password=?', [email, password], nadiUserId, errorHandler);}, errorHandler, sveOk);
}

var username;

function nadiUserId(t,rez) {
	if(rez != null && rez.rows != null){
		var podatak = rez.rows.item(0);
		userId = podatak.UserId;
		username = podatak.username;
		sessionStorage.setItem("userId",userId);
		sessionStorage.setItem("username",username);
	}
}













function brisiBazu(){
	db.transaction(function(t){t.executeSql('DROP TABLE Likes', [], sveOk, errorHandler);}, errorHandler, sveOk);
	db.transaction(function(t){t.executeSql('DROP TABLE Users', [], sveOk, errorHandler);}, errorHandler, sveOk);
	db.transaction(function(t){t.executeSql('DROP TABLE Movies', [], sveOk, errorHandler);}, errorHandler, sveOk);
	db.transaction(stvoriTablicuLikeova, errorHandler, sveOk);
	db.transaction(stvoriTablicuKorisnika, errorHandler, sveOk);
	db.transaction(stvoriTablicuFilmova, errorHandler, sveOk);
}













var upit='SELECT * FROM Movies;';

function sortiraj(kriterij) {
	console.log(kriterij);
	if(kriterij=='zanr'){
		upit='SELECT * FROM Movies ORDER BY genre ASC;';
	}else if (kriterij=='godine') {
		upit='SELECT * FROM Movies ORDER BY year DESC;';
	}else if (kriterij=='ocjene') {
		upit='SELECT * FROM Movies ORDER BY likes DESC;';
	}
	ucitajFilmove();
}

function ucitajFilmove() {
  document.getElementById('filmovi').innerHTML='';
  db.transaction(citaj, errorHandler, sveOk);
}

function citaj(t){
	t.executeSql(upit, [], obradaRezultata, errorHandler);
}

var movieLikes;

function obradaRezultata(t,rez){
	console.log(t);
	console.log(rez);

	if(rez != null && rez.rows != null){
		for(var i = 0; i<rez.rows.length; i++){
			var podatak = rez.rows.item(i);
      var id = podatak.MovieId;
			movieLikes=podatak.likes;
      document.getElementById('filmovi').innerHTML+='\
      <div class="w3-col l3 m3 s6">\
        <div class="w3-container">\
          <div class="w3-display-container">\
            <img src="img/'+podatak.title+'.jpg" style="width:100%">\
              <span class="w3-tag w3-display-topleft">'+podatak.likes+' <i class="fa fa-thumbs-up"></i></span>\
							<span class="w3-tag w3-display-bottomright">'+podatak.genre+'</span>\
                <div class="w3-display-middle w3-display-hover">\
                  <button class="w3-button w3-black" style="width:100%" onclick="Film('+podatak.MovieId+','+movieLikes+');" id="detalji">Detalji <i class="fa fa-search"></i></button>\
                </div>\
          </div>\
          <p>'+podatak.title+'<br><b>'+podatak.year+'</b></p>\
        </div>\
      </div>'
		}
	}
}

function Film(id, likes) {
  localStorage.setItem("filmId",id);
	localStorage.setItem("likes",likes);
	console.log('posla sam ' + movieLikes);
  window.location="film.html";
}

function punjenjeTabliceFilmova(t) {
  t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	A Million Ways to Die", 	2014	, "	Western	", "	Set in 1882 in the American west, Albert is a lowly farmer with a nice girlfriend. But when she leaves him for the more successful and handsome owner of a moustachery store, Albert returns to his lonely daily life of trying to avoid death. Then the mysterious Anna rides into town and captures Albert s interest and heart, but with her deadly husband in town, Albert is going to have to become the western gun-slinging hero he never was. It won t be easy because there are a million ways to die in the west.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Arrival	", 	2016	, "	Drama	", "	Linguistics professor Louise Banks leads an elite team of investigators when gigantic spaceships touchdown in 12 locations around the world. As nations teeter on the verge of global war, Banks and her crew must race against time to find a way to communicate with the extraterrestrial visitors. Hoping to unravel the mystery, she takes a chance that could threaten her life and quite possibly all of mankind.		",-3], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Assassin s Creed	", 	2016	, "	Drama	", "	Through a revolutionary technology that unlocks his genetic memories, Callum Lynch (Michael Fassbender) experiences the adventures of his ancestor, Aguilar de Nerha, in 15th Century Spain. Callum discovers he is descended from a mysterious secret society, the Assassins, and amasses incredible knowledge and skills to take on the oppressive and powerful Templar organization in the present day.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Avengers Infinity War	", 	2018	, "	Akcija	", "	As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Baywatch	", 	2017	, "	Komedija	", "	In sun-kissed Emerald Bay, the vigorous Lieutenant Mitch Buchannon and Baywatch, his elite team of hand-picked and perfectly tanned lifeguards, protect the bay, keeping both sunbathers and beach lovers safe. However, this summer, two new eager trainees will join the demanding life-saving program, as well as an insubordinate former Olympic swimmer, who are all called to prove their worth on the lifeguard towers just on time when a new synthetic street drug begins to infest the Emerald Bay: the flakka. Without a doubt, this calls for some serious undercover teamwork action, as the badgeless heroes in spandex comb the beach for shady newcomers and nefarious entrepreneurs with hidden agendas of their own. Can Mitch s band save the bay?		",-1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Big Hero 6	", 	2014	, "	Animirani	", "	When a devastating event befalls the city of San Fransokyo and catapults Hiro into the midst of danger, he turns to Baymax and his close friends adrenaline junkie Go Go Tomago, neatnik Wasabi, chemistry whiz Honey Lemon and fanboy Fred. Determined to uncover the mystery, Hiro transforms his friends into a band of high-tech heroes called Big Hero 6.		",1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Black Panther	", 	2018	, "	Akcija	", "	After the events of Captain America: Civil War, Prince T Challa returns home to the reclusive, technologically advanced African nation of Wakanda to serve as his country s new king. However, T Challa soon finds that he is challenged for the throne from factions within his own country. When two foes conspire to destroy Wakanda, the hero known as Black Panther must team up with C.I.A. agent Everett K. Ross and members of the Dora Milaje, Wakandan special forces, to prevent Wakanda from being dragged into a world war.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Blockers	", 	2018	, "	Komedija	", "	Three parents try to stop their daughters from losing their virginity on prom night.		",1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Brimstone	", 	2016	, "	Western	", "	A triumphant epic of survival and a tale of powerful womanhood and resistance against the unforgiving cruelty of a hell on earth. Our heroine is Liz (Dakota Fanning), carved from the beautiful wilderness, full of heart and grit, hunted by a vengeful Preacher (Guy Pearce) - a diabolical zealot and her twisted nemesis. But Liz is a genuine survivor; she s no victim - a woman of fearsome strength who responds with astonishing bravery to claim the better life she and her daughter deserve. Fear not. Retribution is coming.		",1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Cars 3	", 	2017	, "	Animirani	", "	Blindsided by a new generation of blazing-fast racers, the legendary Lightning McQueen is suddenly pushed out of the sport he loves. To get back in the game, he will need the help of an eager young race technician with her own plan to win, inspiration from the late Fabulous Hudson Hornet, and a few unexpected turns. Proving that #95 isn t through yet will test the heart of a champion on Piston Cup Racing s biggest stage!		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Coco	", 	2017	, "	Animirani	", "	Despite his family s baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz. Desperate to prove his talent, Miguel finds himself in the stunning and colorful Land of the Dead following a mysterious chain of events. Along the way, he meets charming trickster Hector, and together, they set off on an extraordinary journey to unlock the real story behind Miguel s family history.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Daddy s Home	", 	2015	, "	Komedija	", "	Stepfather Brad Whitaker is hoping for his stepchildren to love him and treat him like a dad. All is going well until the biological father, Dusty Mayron, shows up, then everything takes a toll. His stepchildren start putting him second and their father first, and now Dusty will have to learn that being a good dad is about pains and struggles. Brad will also experience once again what it s like to be a stepdad.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Deadpool 2	", 	2018	, "	Akcija	", "	After losing the love of his life, 4th wall-breaking mercenary Wade Wilson aka Deadpool (Ryan Reynolds) must protect Russel (Julian Dennison) must assemble a team of mutants and protect Russel from Cable (Josh Brolin), a no-nonsense, dangerous cyborg from the future and Deadpool must learn the most important lesson of all, to be part of a family again.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Despicable Me 3	", 	2017	, "	Animirani	", "	After he is fired from the Anti-Villain League for failing to take down the latest bad guy to threaten humanity, Gru finds himself in the midst of a major identity crisis. But when a mysterious stranger shows up to inform Gru that he has a long-lost twin brother-a brother who desperately wishes to follow in his twin s despicable footsteps-one former super-villain will rediscover just how good it feels to be bad.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Django Unchained	", 	2012	, "	Western	", "	In 1858, a bounty hunter named Schultz seeks out a slave named Django and buys him because he needs him to find some men he is looking for. After finding them, Django wants to find his wife, Brunhilde, who along with him were sold separately by his former owner for trying to escape. Schultz offers to help him if he chooses to stay with him and be his partner. Eventually they learn that she was sold to a plantation in Mississipi. Knowing they can t just go in and say they want her, they come up with a plan so that the owner will welcome them into his home and they can find a way.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Doctor Strange	", 	2016	, "	Akcija	", "	Marvel s Doctor Strange follows the story of the talented neurosurgeon Doctor Stephen Strange who, after a tragic car accident, must put ego aside and learn the secrets of a hidden world of mysticism and alternate dimensions. Based in New York City s Greenwich Village, Doctor Strange must act as an intermediary between the real world and what lies beyond, utilising a vast array of metaphysical abilities and artifacts to protect the Marvel Cinematic Universe.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Dunkirk	", 	2017	, "	Drama	", "	Evacuation of Allied soldiers from the British Empire, and France, who were cut off and surrounded by the German army from the beaches and harbor of Dunkirk, France, between May 26- June 04, 1940, during Battle of France in World War II.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Ex Machina	", 	2014	, "	Drama	", "	Caleb, a 26 year old programmer at the world s largest internet company, wins a competition to spend a week at a private mountain retreat belonging to Nathan, the reclusive CEO of the company. But when Caleb arrives at the remote location he finds that he will have to participate in a strange and fascinating experiment in which he must interact with the world s first true artificial intelligence, housed in the body of a beautiful robot girl.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Game Night	", 	2018	, "	Komedija	", "	Six close friends meet each week for a game night involving board games, charades and pop culture trivia quizzes. Being the most competitive of the bunch, Max and his wife Annie, who seem to be a perfect match in every way, usually win every time. However, their marriage is on rocky ground as Annie fears that Max doesn t want to have children. When Max s shady brother Brooks reappears after a long mysterious absence and suggests that they have their next gathering at his place, no one expects that their weekly game night is about to go to the next level as Brooks organizes a full blown murder mystery party complete with actors as criminals and cops for them. However, when Brooks is violently kidnapped in front of everyone, it turns out that the game is all too real.",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Going in Style	", 	2017	, "	Komedija	", "	A reboot of the 1979 movie that was directed by Martin Brest and featured George Burns, Art Carney, and Lee Strasberg. Three seniors, who are living social security check to check and even reduced to eating dog food at times, decide they have had enough. So, they plan to rob a bank...problem is, they don t even know how to handle a gun! A social commentary on growing old in America and what we are sometimes driven to, due to circumstances.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Hell or High Water	", 	2016	, "	Western	", "	In Texas, after the death of his mother, the unemployed oil and gas worker Toby Howard is losing his ranch to the Texas Midlands Bank. Toby is divorced from his wife who lives with their two sons. When his brother Tanner Howard is released from the prison, they team up to rob agencies of the Texas Midlands Bank to raise money to pay the loan so that Toby may leave the real estate to his sons. Meanwhile the Texas Ranger Marcus Hamilton who is near retirement and his Indian descendant partner Alberto Parker try to anticipate the next move of the thieves.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Home	", 	2015	, "	Animirani	", "	When Oh, a loveable misfit from another planet, lands on Earth and finds himself on the run from his own people, he forms an unlikely friendship with an adventurous girl named Tip who is on a quest of her own. Through a series of comic adventures with Tip, Oh comes to understand that being different and making mistakes is all part of being human. And while he changes her planet and she changes his world, they discover the true meaning of the word HOME.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Horrible Bosses 2	", 	2014	, "	Komedija	", "	Fed up with answering to higher-ups, Nick, Dale and Kurt decide to become their own bosses by launching their own business. But a slick investor soon pulls the rug out from under them. Outplayed and desperate, and with no legal recourse, the three would-be entrepreneurs hatch a misguided plan to kidnap the investor s adult son and ransom him to regain control of their company.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Hostiles	", 	2017	, "	Western	", "	In 1892, after nearly two decades of fighting the Cheyenne, the Apache, and the Comanche natives, the United States Cavalry Captain and war hero, Joseph Blocker, is ordered to escort the ailing Cheyenne chief, Yellow Hawk--his most despised enemy--to his ancestral home in Montana s Valley of the Bears. Nauseated with a baleful anger, Joseph s unwelcome final assignment in the feral American landscape is further complicated, when the widowed settler, Rosalie Quaid, is taken in by the band of soldiers, as aggressive packs of marauding Comanches who are still on the warpath, are thirsty for blood. In a territory crawling with hostiles, can the seasoned Captain do his duty one last time?		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Interstellar	", 	2014	, "	Drama	", "	Earth s future has been riddled by disasters, famines, and droughts. There is only one way to ensure mankind s survival: Interstellar travel. A newly discovered wormhole in the far reaches of our solar system allows a team of astronauts to go where no man has gone before, a planet that may have the right environment to sustain human life.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Logan	", 	2017	, "	Drama	", "	In 2029 the mutant population has shrunken significantly due to genetically modified plants designed to reduce mutant powers and the X-Men have disbanded. Logan, whose power to self-heal is dwindling, has surrendered himself to alcohol and now earns a living as a chauffeur. He takes care of the ailing old Professor X whom he keeps hidden away. One day, a female stranger asks Logan to drive a girl named Laura to the Canadian border. At first he refuses, but the Professor has been waiting for a long time for her to appear. Laura possesses an extraordinary fighting prowess and is in many ways like Wolverine. She is pursued by sinister figures working for a powerful corporation; this is because they made her, with Logan s DNA. A decrepit Logan is forced to ask himself if he can or even wants to put his remaining powers to good use. ",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Moana	", 	2016	, "	Animirani	", "	Moana Waialiki is a sea voyaging enthusiast and the only daughter of a chief in a long line of navigators. When her island s fishermen can t catch any fish and the crops fail, she learns that the demigod Maui caused the blight by stealing the heart of the goddess, Te Fiti. The only way to heal the island is to persuade Maui to return Te Fiti s heart, so Moana sets off on an epic journey across the Pacific. The film is based on stories from Polynesian mythology.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Ocean s Eight	", 	2018	, "	Komedija	", "	Danny Ocean s estranged sister Debbie attempts to pull off the heist of the century at New York City s star-studded annual Met Gala. Her first stop is to assemble the perfect all-female crew: Lou, Rose, Daphne Kluger, Nine Ball, Tammy, Amita, and Constance.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Passengers	", 	2016	, "	Drama	", "	The spaceship, Starship Avalon, in its 120-year voyage to a distant colony planet known as the Homestead Colony and transporting 5,258 people has a malfunction in one of its sleep chambers. As a result one hibernation pod opens prematurely and the one person that awakes, Jim Preston (Chris Pratt) is stranded on the spaceship, still 90 years from his destination.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Pixels	", 	2015	, "	Komedija	", "	Sam Brenner, Will Cooper, Ludlow Lamonsoff, and Eddie The Fire Blaster Plant all played classic arcade video games as teenagers. But now they have to use their skills to try to save the world from aliens. The aliens watched video feeds that they thought was a declaration of war. So they send down the classic arcade games to destroy earth. They also get help from a military specialist. They have three lives and if all three get used then earth will be destroyed, and every time they lose a live the aliens take someone s life. Who will win, us or the aliens? It s an all-out battle to save our planet and everyone on it.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Rampage	", 	2018	, "	Akcija	", "	Primatologist Davis (Dwayne Johnson) shares an unshakable bond with George, the extraordinarily intelligent silverback gorilla who has been in his care since he was young. When a greed-fueled corporation s genetic experiment goes awry, George and other animals across the country are mutated into aggressive supercreatures who destroy everything in their path. In this adrenaline-filled ride, Davis tries to find an antidote, not only to halt a global catastrophe but also to save the fearsome creature who was once his friend.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Sing	", 	2016	, "	Animirani	", "	In a town with no humans, just animals, a koala named Buster Moon realizes he will soon lose his theater if he cannot turn his luck around. He comes up with a plan to host a singing competition, where the winner will receive $1,000. Will this be enough to return his theater to glory?		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Slow West	", 	2015	, "	Western	", "	Slow West  follows a 16-year-old boy on a journey across 19th Century frontier America in search of the woman he loves, while accompanied by mysterious traveler Silas.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Spider-Man Homecoming	", 	2017	, "	Akcija	", "	Thrilled by his experience with the Avengers, Peter returns home, where he lives with his Aunt May, under the watchful eye of his new mentor Tony Stark, Peter tries to fall back into his normal daily routine - distracted by thoughts of proving himself to be more than just your friendly neighborhood Spider-Man - but when the Vulture emerges as a new villain, everything that Peter holds most important will be threatened.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Force Awakens", 	2015	, "	Akcija	", "	30 years after the defeat of Darth Vader and the Empire, Rey, a scavenger from the planet Jakku, finds a BB-8 droid that knows the whereabouts of the long lost Luke Skywalker. Rey, as well as a rogue stormtrooper and two smugglers, are thrown into the middle of a battle between the Resistance and the daunting legions of the First Order.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Storks	", 	2016	, "	Animirani	", "	Storks deliver babies...or at least they used to. Now they deliver packages for global internet giant Cornerstore.com. Junior, the company s top delivery stork, is about to be promoted when he accidentally activates the Baby Making Machine, producing an adorable and wholly unauthorized baby girl. Desperate to deliver this bundle of trouble before the boss gets wise, Junior and his friend Tulip, the only human on Stork Mountain, race to make their first-ever baby drop - in a wild and revealing journey that could make more than one family whole and restore the storks  true mission in the world.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Sully	", 	2016	, "	Drama	", "	On Thursday, January 15th, 2009, the world witnessed the Miracle on the Hudson when Captain Chesley Sullenberger, nicknamed Sully, glided his disabled plane onto the frigid waters of the Hudson River, saving the lives of all 155 aboard. However, even as Sully was being heralded by the public and the media for his unprecedented feat of aviation skill, an investigation was unfolding that threatened to destroy his reputation and his career.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Boss Baby	", 	2017	, "	Animirani	", "	Seven-year-old Tim Templeton has always had an overactive imagination--and for the past seven years--life has been all peaches for him, getting all the love and affection from his caring parents. However, after the arrival of Boss Baby, an unexpected new brother dressed in a black suit complete with a tie and a briefcase, Tim won t be the centre of attention anymore, as the powerful sibling takes over the whole house, robbing him of all care, little by little. But, soon, Tim and the new Boss in a diaper will need to put differences aside and join forces, as a sneaky scheme involving the head of Puppy Co. threatens to tilt the balance of power towards their insidiously adorable furry antagonists, not to mention that the next Pet Convention is only in two days. Brothers, hurry up.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Dark Tower	", 	2017	, "	Western	", "	The last Gunslinger: Roland Deschain, has been locked in an eternal battle with Walter O Dim, also known as the Man in Black, and determined to prevent him from toppling the Dark Tower that holds the universe together. With the fate of the world at stake, good and evil will collide in the ultimate battle, as only Roland can defend the Tower from the Man in Black.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Hateful Eight	", 	2015	, "	Western	", "	Some time after the Civil War, a stagecoach hurtles through the wintry Wyoming landscape. Bounty hunter John Ruth and his fugitive captive Daisy Domergue race towards the town of Red Rock, where Ruth will bring Daisy to justice. Along the road, they encounter Major Marquis Warren (an infamous bounty hunter) and Chris Mannix (a man who claims to be Red Rock s new sheriff). Lost in a blizzard, the bunch seeks refuge at Minnie s Haberdashery. When they arrive they are greeted by unfamiliar faces: Bob, who claims to be taking care of the place while Minnie is gone; Oswaldo Mobray, the hangman of Red Rock; Joe Gage, a cow puncher; and confederate general Sanford Smithers. As the storm overtakes the mountainside, the eight travelers come to learn that they might not make it to Red Rock after all...		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["Mockingjay Part 2	", 	2015	, "	Akcija	", "	After young Katniss Everdeen agrees to be the symbol of rebellion, the Mockingjay, she tries to return Peeta to his normal state, tries to get to the Capitol, and tries to deal with the battles coming her way...but all for her main goal: assassinating President Snow and returning peace to the Districts of Panem. As her squad starts to get smaller and smaller, will she make it to the Capitol? Will she get revenge on Snow or will her target change? Will she be with her Star-Crossed Lover, Peeta, or her long-time friend, Gale? Deaths, bombs, bow and arrows, a love triangle, hope... What will happen?		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["The Interview", 	2014	, "	Komedija	", "	In the action-comedy The Interview, Dave Skylark (James Franco) and his producer Aaron Rapoport (Seth Rogen) run the popular celebrity tabloid TV show Skylark Tonight. When they discover that North Korean dictator Kim Jong-un is a fan of the show, they land an interview with him in an attempt to legitimize themselves as journalists. As Dave and Aaron prepare to travel to Pyongyang, their plans change when the CIA recruits them, perhaps the two least-qualified men imaginable, to assassinate Kim Jong-un.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Lone Ranger	", 	2013	, "	Western	", "	In the 1930s, an elderly Tonto tells a young boy the tale of John Reid, the Lone Ranger. An idealistic lawyer, he rides with his brother and fellow Texas Rangers in pursuit of the notorious Butch Cavendish. Ambushed by the outlaw and left for dead, John Reid is rescued by the renegade Comanche, Tonto, at the insistence of a mysterious white horse and offers to help him to bring Cavendish to justice. Becoming a reluctant masked rider with a seemingly incomprehensible partner, Reid pursues the criminal against all obstacles. However, John and Tonto learn that Cavendish is only part of a far greater injustice and the pair must fight it in an adventure that would make them a legend.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Magnificent Seven	", 	2016	, "	Western	", "	Director Antoine Fuqua brings his modern vision to a classic story in The Magnificent Seven. With the town of Rose Creek under the deadly control of industrialist Bartholomew Bogue, the desperate townspeople employ protection from seven outlaws, bounty hunters, gamblers and hired guns. As they prepare the town for the violent showdown that they know is coming, these seven mercenaries find themselves fighting for more than money.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	The Revenant	", 	2015	, "	Akcija	", "	While exploring uncharted wilderness in 1823, legendary frontiersman Hugh Glass sustains injuries from a brutal bear attack. When his hunting team leaves him for dead, Glass must utilize his survival skills to find a way back home while avoiding natives on their own hunt. Grief-stricken and fueled by vengeance, Glass treks through the wintry terrain to track down John Fitzgerald, the former confidant who betrayed and abandoned him.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Thor Ragnarok	", 	2017	, "	Akcija	", "	Thor is imprisoned on the other side of the universe and finds himself in a race against time to get back to Asgard to stop Ragnarok, the destruction of his homeworld and the end of Asgardian civilization, at the hands of an all-powerful new threat, the ruthless Hela.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Tomb Raider	", 	2018	, "	Drama	", "	Lara Croft is the fiercely independent daughter of an eccentric adventurer who vanished when she was scarcely a teen. Now a young woman of 21 without any real focus or purpose, Lara navigates the chaotic streets of trendy East London as a bike courier, barely making the rent, and takes college courses, rarely making it to class. Determined to forge her own path, she refuses to take the reins of her father s global empire just as staunchly as she rejects the idea that he s truly gone. Advised to face the facts and move forward after seven years without him, even Lara can t understand what drives her to finally solve the puzzle of his mysterious death. ",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Trolls	", 	2016	, "	Animirani	", "	From the creators of Shrek comes the most smart, funny, irreverent animated comedy of the year, DreamWorks  Trolls. This holiday season, enter a colorful, wondrous world populated by hilariously unforgettable characters and discover the story of the overly optimistic Trolls, with a constant song on their lips, and the comically pessimistic Bergens, who are only happy when they have trolls in their stomach. Featuring original music from Justin Timberlake, and soon-to-be classic mash-ups of songs from other popular artists, the film stars the voice talents of Anna Kendrick, Justin Timberlake, Russell Brand, James Corden, Kunal Nayyar, Ron Funches, Icona Pop, Gwen Stefani, and many more. DreamWorks  TROLLS is a fresh, broad comedy filled with music, heart and hair-raising adventures.",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	War for the Planet of the Apes	", 	2017	, "	Drama	", "	Caesar and his apes are forced into a deadly conflict with an army of humans led by a ruthless Colonel. After the apes suffer unimaginable losses, Caesar wrestles with his darker instincts and begins his own mythic quest to avenge his kind. As the journey finally brings them face to face, Caesar and the Colonel are pitted against each other in an epic battle that will determine the fate of both their species and the future of the planet.		",0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Movies (title, year, genre, description, likes) VALUES (?, ?, ?, ?, ?)",["	Why Him	", 	2016	, "	Komedija	", "	Over the holidays, Ned, an overprotective but loving dad and his family visit his daughter at Stanford, where he meets his biggest nightmare: her well-meaning but socially awkward Silicon Valley millionaire boyfriend, Laird. The rivalry develops,and Ned s panic level goes through the roof when he finds himself lost in this glamorous high-tech world and learns that Laird is about to pop the question.		",0], sveOk, errorHandler);

	//------------------------------PRIAVLJENI KORISNICI--------------------------------------------------
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Vickie", "vickie@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Louis", "louis@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Nellie", "nellie@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Brooklyn", "brooklyn@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Jackson", "jackson@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Bart", "bart@mail.com", "123"], sveOk, errorHandler);
	t.executeSql("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",["Richard", "richard@mail.com", "123"], sveOk, errorHandler);

	//------------------------------PRIPREMLJENI LIKEOVI--------------------------------------------------
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[1, 2, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[1, 5, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[1, 6, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[1, 9, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[2, 5, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[2, 6, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[2, 9, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[3, 2, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[3, 5, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[3, 6, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[4, 2, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[4, 5, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[5, 2, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[5, 5, 0, 1], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[5, 9, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[6, 8, 1, 0], sveOk, errorHandler);
	t.executeSql("INSERT INTO Likes (UserId, MovieID, like, dislike) VALUES (?, ?, ?, ?)",[7, 2, 1, 0], sveOk, errorHandler);
}
