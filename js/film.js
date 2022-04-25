var db;
var shortName='Moja baza';
var version='1.0';
var displayName='Moja WebSQL baza';
var maxSize=65535;

db=openDatabase(shortName, version, displayName, maxSize);

function sveOk(){
	console.log('Akcija izvrsena');
}

function errorHandler(transaction,err){
	alert('Greska: '+err.message+' kod: '+err.code);
}

var idFilma=localStorage.getItem("filmId");
var userId = sessionStorage.getItem("userId");
var movieLikes = localStorage.getItem("likes");
movieLikes=parseInt(movieLikes);

window.onload = function () {
	if(sessionStorage.getItem("userId") != null){
		username=sessionStorage.getItem('username');
		userId=sessionStorage.getItem('userId');
		document.getElementById('odjava').style.display = "block";
	}else {
		document.getElementById('odjava').style.display = "none";
	}
  ucitajFilm();
	ucitajLike();
	document.getElementById('odjava').addEventListener('click', odjava);
}

function odjava() {
	sessionStorage.clear();
	window.location="index.html";
	console.log("ocu se odjavit");
}

function odjava() {
	sessionStorage.clear();
	window.location="index.html";
	console.log("ocu se odjavit");
}

function preporuka() {
	window.location="preporuka.html";
}

function ucitajFilm() {
  document.getElementById('filmovi').innerHTML='';
  db.transaction(citaj, errorHandler, sveOk);
}

function citaj(t){
	t.executeSql('SELECT * FROM Movies WHERE MovieId = ?;', [idFilma], obradaRezultata, errorHandler);
}

var podatak;

function obradaRezultata(t,rez) {
	console.log(rez);

	if(rez != null && rez.rows != null){
		for(var i = 0; i<rez.rows.length; i++){
			podatak = rez.rows.item(i);
      document.getElementById('logiranikorisnik').innerHTML=podatak.title;

      document.getElementById('filmovi').innerHTML+='\
      <div class="w3-col l3 m3 s6">\
        <div class="w3-container">\
          <div class="w3-display-container">\
            <img src="img/'+podatak.title+'.jpg" style="width:100%">\
          </div>\
          <div class="w3-row l3 m3 s6">\
						<p><a class="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-up" id="like" onclick="provjera(1)"></a>\
						<a class="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-down" id="dislike" onclick="provjera(2)"></a></p>\
					</div>\
        </div>\
      </div>\
      <div class="w3-col l9 m9 s12">\
        <div class="w3-container">\
          <div class="w3-display-container">\
          <h4>'+podatak.year+'</h4>\
          <h4>'+podatak.genre+'</h4>\
          </div>\
          <p>'+podatak.description+'</p>\
        </div>\
      </div>'
    }
  }
}

function provjera(br) {
	if(sessionStorage.getItem("userId") != null){
		if(br==1){
			dodajLike();
		}
		else if (br==2) {
			dodajDisike();
		}
	}
	else {
		alert('Trebate biti prijavljeni!')
	}
}

function greskaCitanjaFIlma() {
	var modal = document.getElementById('myModal');
	var span = document.getElementsByClassName("closeModal")[0];

	modal.style.display = "block";

	span.onclick = function() {
	    modal.style.display = "none";
	}

	window.onclick = function(event) {
	    if (event.target == modal) {
	        modal.style.display = "none";
	    }
	}
}

function ucitajLike() {
	db.transaction(ucitajLajkove, errorHandler, sveOk);
}

function ucitajLajkove(t) {
	t.executeSql('SELECT like, dislike FROM Likes WHERE UserId=? AND MovieId=?', [userId, idFilma], vidilajkove, errorHandler);
}

var imaLajkova=false;

function vidilajkove(t,rez) {
	if(rez.length!=0){
		var podatak = rez.rows.item(0);
		console.log(podatak.like);
		if (podatak.like == 1){
			document.getElementById('like').className="w3-button w3-green w3-padding-large w3-large fa fa-thumbs-up";
			document.getElementById('dislike').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-down";
		}else {
			document.getElementById('like').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-up";
			document.getElementById('dislike').className="w3-button w3-red w3-padding-large w3-large fa fa-thumbs-down";
		}
		imaLajkova = true;
	}else {
		document.getElementById('like').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-up";
		document.getElementById('dislike').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-down";
		imaLajkova = false;
	}
}

function dodajLike() {
	document.getElementById('like').className="w3-button w3-green w3-padding-large w3-large fa fa-thumbs-up";
	document.getElementById('dislike').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-down";

	db.transaction(newLike, errorHandler, sveOk);
}

function dodajDisike() {
	document.getElementById('like').className="w3-button w3-black w3-padding-large w3-large fa fa-thumbs-up";
	document.getElementById('dislike').className="w3-button w3-red w3-padding-large w3-large fa fa-thumbs-down";

	db.transaction(newDislike, errorHandler, sveOk);
}

function newLike(t){
	if(imaLajkova==true){
		t.executeSql('UPDATE Likes SET like=? WHERE MovieId=? AND UserId=?', [1, idFilma, userId]);
		t.executeSql('UPDATE Likes SET dislike=? WHERE MovieId=? AND UserId=?', [0, idFilma, userId]);
	}
	else{
		t.executeSql('INSERT INTO Likes (UserId, MovieId, like, dislike) VALUES (?, ?, ?, ?)', [userId, idFilma, 1, 0], sveOk, errorHandler);
	}
	updateMoviesLikes(true);
}

function newDislike(t) {
	if(imaLajkova==true){
		t.executeSql('UPDATE Likes SET like=? WHERE MovieId=? AND UserId=?', [0, idFilma, userId]);
		t.executeSql('UPDATE Likes SET dislike=? WHERE MovieId=? AND UserId=?', [1, idFilma, userId]);
	}
	else{
		t.executeSql('INSERT INTO Likes (UserId, MovieId, like, dislike) VALUES (?, ?, ?, ?)', [userId, idFilma, 0, 1], sveOk, errorHandler);
	}
	updateMoviesLikes(false);
}


function updateMoviesLikes(x){
	if(x==true){
		movieLikes=movieLikes+1;
		db.transaction(function(t){t.executeSql('UPDATE Movies SET likes=? WHERE MovieId=?', [movieLikes, idFilma], sveOk, errorHandler);}, errorHandler, sveOk);
	}else {
		movieLikes=movieLikes-1;
		db.transaction(function(t){t.executeSql('UPDATE Movies SET likes=? WHERE MovieId=?', [movieLikes, idFilma], sveOk, errorHandler);}, errorHandler, sveOk);
	}
}
