var db;
var shortName='Moja baza';
var version='1.0';
var displayName='Moja WebSQL baza';
var maxSize=65535;

db=openDatabase(shortName, version, displayName, maxSize);

function sveOk(){

}

function errorHandler(transaction,err){
	alert('Greska: '+err.message+' kod: '+err.code);
}

var userId = sessionStorage.getItem("userId");

window.onload = function() {
  document.getElementById('sadrzaj').innerHTML="Preporučeni filmovi na osnovu sličnih korisnika: ";
  izvuciKorisnikoveOcjene();
  izvuciOstaleOcjene();
	document.getElementById('odjava').addEventListener('click', odjava);
}

function odjava() {
	sessionStorage.clear();
	window.location="index.html";
}

function preporuka() {
	window.location="preporuka.html";
}

function izvuciKorisnikoveOcjene() {
  db.transaction(function(t){t.executeSql('SELECT * FROM Likes WHERE UserId=?', [userId], korisnikoveOcjene, errorHandler);}, errorHandler, sveOk);
}

var listaOcjena = [];
var postotak = 0;

function korisnikoveOcjene(t,rez) {
  if(rez != null && rez.rows != null){
    var korak=0;
    postotak = 1 / rez.rows.length;
		for(var i = 0; i<rez.rows.length; i++){
			podatak = rez.rows.item(i);
      listaOcjena[korak]={movie:podatak.MovieID,like:podatak.like}
      korak++;
    }
    console.log(listaOcjena);
  }
}

function izvuciOstaleOcjene() {
  db.transaction(function(t){t.executeSql('SELECT * FROM Likes WHERE UserId<>? ORDER BY UserId', [userId], ostaleOcjene, errorHandler);}, errorHandler, sveOk);
}

var listaOstalihKorisnika = [];
var listaNajblizihSusjeda = [];

function ostaleOcjene(t,rez) {
  if(rez != null && rez.rows != null){
    var brKoraka=0;
    var ukupniPostotak=0;
    var brSusjeda = 0;
		var userId;
    var id=null;
		for(var i = 0; i<rez.rows.length; i++){
		  podatak = rez.rows.item(i);
		  for(var j = 0; j<listaOcjena.length;j++){
			  userId=podatak.UserId;
			  if(id!=podatak.UserId){
					if(id!=null){
					  console.log(id + "--->>>"+ukupniPostotak);
					  if(ukupniPostotak>0.66){
							listaNajblizihSusjeda[brSusjeda] = {id:id, postotak:ukupniPostotak};
							brSusjeda++;
					  }
					}
					id=podatak.UserId;
					ukupniPostotak=0;
				}
				if(podatak.MovieID == listaOcjena[j].movie && podatak.like == listaOcjena[j].like){
					ukupniPostotak += postotak;
				}
			}
		  listaOstalihKorisnika[brKoraka]={id:podatak.UserId,movie:podatak.MovieID,like:podatak.like};
		  brKoraka++;
		}
    console.log(id + "--->>>"+ukupniPostotak);
    if(ukupniPostotak>0.66){
      listaNajblizihSusjeda[brSusjeda] = {id:podatak.UserId, postotak:ukupniPostotak};
      brSusjeda++;
    }
  }
	console.log("Ostali korisnici:");
  console.log(listaOstalihKorisnika);
	console.log("Najblizi susjedi:");
  console.log(listaNajblizihSusjeda);
	if(listaNajblizihSusjeda.length == 0){
		document.getElementById('sadrzaj').innerHTML+="<br><br>Trenutno nemamo preporuka za vas!";
	}
  for(var i=0;i<listaNajblizihSusjeda.length;i++){
    var korisnik = listaNajblizihSusjeda[i].id;
    preporuciFilmove(korisnik);
  }
}

function preporuciFilmove(korisnik) {
  db.transaction(function(t){t.executeSql('SELECT * FROM Likes WHERE UserId=? AND like=?', [korisnik,1], vidiPreporučene, errorHandler);}, errorHandler, sveOk);
}

var listaPreporuka = [];

function vidiPreporučene(t,rez) {
  for(var i = 0; i<rez.rows.length; i++){
    var provjeri = false;
    podatak = rez.rows.item(i);
    console.log(podatak.UserId + " >>> " + podatak.MovieID);
    console.log(listaOcjena);
    for(var j=0; j<listaOcjena.length;j++){
      if(podatak.MovieID == listaOcjena[j].movie){
        provjeri = true;
      }
    }
    if(provjeri==false){
      console.log("Potencijalna preporuke " + podatak.MovieID);
      listaPreporuka.push(podatak.MovieID);
    }
  }
  console.log(listaPreporuka);
	filtrirajPreporucene(listaPreporuka);
}

function filtrirajPreporucene(uniqueArray) {
	db.transaction(filtrirajPreporucene2, errorHandler, sveOk);
}

function filtrirajPreporucene2(t) {
	t.executeSql('SELECT * FROM Movies WHERE MovieId IN ('+listaPreporuka+')', [], vidiPreporucene, errorHandler);
}

var movieLikes;
var listaPreporucenih = [];

function vidiPreporucene(t,rez) {
  console.log(t);
  console.log(rez);
  for(var i = 0; i<rez.rows.length; i++){
    podatak = rez.rows.item(i);
		movieLikes=podatak.likes;
		if(!listaPreporucenih.includes(podatak.MovieId)){
			listaPreporucenih.push(podatak.MovieId);
	    console.log(podatak);
	    //console.log(podatak.MovieId + " ");
			document.getElementById('filmovi').innerHTML+='\
	      <div class="w3-col l3 m3 s6">\
	        <div class="w3-container">\
	          <div class="w3-display-container">\
	            <img src="img/'+podatak.title+'.jpg" style="width:100%">\
	            <span class="w3-tag w3-display-topleft">'+podatak.genre+'</span>\
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
	console.log('poslao sam ' + movieLikes);
  window.location="film.html";
}
