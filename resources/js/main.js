//Objetos importantes de canvas.
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

//Objeto nave
var nave ={
	x:100,
	y: canvas.height - 80,
	width:50,
	height:50,
	contador:0
}

//ObjetoJuego
var juego ={
	estado:'iniciando'
}

//Objeto Texto
var textoRespuesta = {
	contador: -1,
	titulo: '',
	subtitulo: ''
}

//Teclado
var teclado = {};

//Array Disparos
var disparos = [];
var disparosEnemigos = [];

//Array Enemigos
var enemigos = [];

//Definir variables para las imagenes
var fondo, imgNave, imgEnemigo, imgDisparo, imgDisparoEnemigo;
var imagenes = ['monster.png', 'laser.png', 'laserEnemigo.png', 'spaceship.png'];
var preloader;

//Definicion de funciones
function loadMedia(){
	preloader = new createjs.LoadQueue(true);
	preloader.onProgress = progresoCarga;
	cargar();
}
function cargar(){
	while(imagenes.length>0){
		var imagen = imagenes.shift(); //Sacar el ultimo elemento del arreglo y retornarlo.
		preloader.loadFile(imagen);
	}
}
function progresoCarga(){
	console.log(parseInt(preloader.progress * 100)+"%");
	if(preloader.progress == 1){
		var interval = window.setInterval(frameLoop,1000/55);
		fondo = new Image();
		fondo.src = 'resources/images/space.jpg';
		imgNave = new Image();
		imgNave.src = 'resources/images/spaceship.png';
		imgDisparo = new Image();
		imgDisparo.src = 'resources/images/laser.png';
		imgDisparoEnemigo = new Image();
		imgDisparoEnemigo.src = 'resources/images/laserEnemigo.png';
		imgEnemigo = new Image();
		imgEnemigo.src = 'resources/images/monster.png';
	}
}
function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		ctx.save();
		if(enemigo.estado == 'vivo') ctx.fillStyle = 'red';
		if(enemigo.estado == 'muerto') ctx.fillStyle = 'black';
		ctx.drawImage(imgEnemigo, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
	}
}

function dibujarFondo(){
	ctx.drawImage(fondo,0,0);
}

function dibujarNave(){
	ctx.save();
	ctx.drawImage(imgNave, nave.x, nave.y, nave.width, nave.height);
	ctx.restore();
}

function agregarEventosTeclado(){
	agregarEvento(document,"keydown", function(e){
		//Ponemos en true la tecla presionada
		teclado[e.keyCode] = true;
		console.log(e.keyCode);
	});
	agregarEvento(document,"keyup", function(e){
		//Ponemos en false la tecla que dejo de ser presionada
		teclado[e.keyCode] = false;
	});
	function agregarEvento(elemento,nombreEvento,funcion){
		if(elemento.addEventListener){
			//Navegadores de verdad
			elemento.addEventListener(nombreEvento,funcion,false);
		}
		else if(elemento.attachEvent){
			//Internet Explorer :(
			elemento.attachEvent(nombreEvento,funcion);
		}
	}
}

//Mueve la nave
function moverNave(){
	//Movimiento a la izquierda
	if (teclado[37]) {
		nave.x -= 6;
		if(nave.x < 0) nave.x = 0; //Tope para que no se salga del cambas
	}
	//Movimiento a la derecha
	var limite = canvas.width - nave.width;
	if (teclado[39]) {
		nave.x += 6;
		if(nave.x > limite) nave.x = limite; //Tope para que no se salga del cambas hacia la derecha
	}
	//Disparos
	if (teclado[32]) {
		//1 Disparo por presion de tecla
		if (!teclado.fire) {
			fire();
			teclado.fire = true;
		}
	}
	else teclado.fire = false;
	if(nave.estado == 'hit'){
		nave.contador++;
		if ((nave.contador >= 20)) {
			nave.contador = 0;
			nave.estado = 'muerto';
			juego.estado = 'perdido';
			textoRespuesta.titulo = 'Game Over';
			textoRespuesta.subtitulo = 'Presiona la tecla r para continuar';
			textoRespuesta.contador = 0 ;
		}
	}
}

//Disparos de los enemigos
function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		ctx.save();
		ctx.drawImage(imgDisparoEnemigo, disparo.x, disparo.y, disparo.width, disparo.height);
		ctx.restore();
	}
}

//Actualizar a los enemigos
function actualizaEnemigos()
{
	function agregarDisparosEnemigos(enemigo){
		return{
			x: enemigo.x,
			y: enemigo.y,
			width: 10,
			height: 33,
			contador: 0
		}
	}
	if (juego.estado == 'iniciando') 
	{
		for(var i = 0; i<10; i++)
		{
			enemigos.push({
				x:10 + (i*50),
				y:10,
				height:40,
				width:40,
				estado:'vivo',
				contador:0
			});
		}
		juego.estado='jugando';
	}
	for (var i in enemigos)
	{
		var enemigo = enemigos[i];
		if (!enemigo) continue;
		if (enemigo && enemigo.estado == 'vivo')
		{
			enemigo.contador++;
			enemigo.x += Math.sin(enemigo.contador * Math.PI / 90)*5; //Recrea el movimiento de los enemigos con la funcion seno.
			
			if (aleatorio(0,enemigos.length * 10) == 4) {
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}

		}
		if (enemigo && enemigo.estado == 'hit') {
			enemigo.contador++;										 //Hace que tarde en desaparecer.
			if (enemigo.contador >= 20) {
				enemigo.estado = 'muerto';
				enemigo.contador = 0;
			};
		};
		enemigos = enemigos.filter(function(enemigo){
			if (enemigo && enemigo.estado != 'muerto') {
			return true;
			}
			else{
			return false;
			}
		});
	}
}

//Mueve los disparos hacia la nave.
function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 3;
	}
	disparosEnemigos = disparosEnemigos.filter(function(disparo){
		return disparo.y < canvas.height;
	});
}

//Mueve los disparos hacia los enemigos.
function moverDisparos(){
	for (var i in disparos){
		var disparo = disparos[i];
		disparo.y -= 2;
	}
	disparos = disparos.filter(function(disparo){
		return disparo.y > 0; //El filtro elimina del arreglo los disparos que superaron el tope del canvas para ahorrar RAM.
	})
}

//Agrega los disparos a un arreglo.
function fire(){
	disparos.push({
		x:nave.x + 20,
		y:nave.y - 10,
		width: 10,
		height: 30
	});
}

//Dibuja los disparos.
function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = 'white';
	for(var i in disparos){
		var disparo = disparos[i];
		ctx.drawImage(imgDisparo, disparo.x, disparo.y, disparo.width, disparo.height);
	}
	ctx.restore();
}
function dibujaTexto(){
	if(textoRespuesta.contador == -1 ) return;
	var alpha = textoRespuesta.contador/50.0;
	if(alpha>1){
		for (var i in enemigos){
			delete enemigos[i];
		}
	}
	ctx.save();
	ctx.globalAlpha = alpha; // Atributo de canvas, efecto.
	
	if(juego.estado == 'perdido'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRespuesta.titulo, 140,200);
		ctx.font = '14pt Arial';
		ctx.fillText(textoRespuesta.subtitulo, 190,250);
	}

	if(juego.estado == 'victoria'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRespuesta.titulo, 140,200);
		ctx.font = '14pt Arial';
		ctx.fillText(textoRespuesta.subtitulo, 190,250);
	}
}
function actualizarEstadoJuego(){
	if (juego.estado == 'jugando' && enemigos.length == 0) {
		juego.estado = 'victoria';
		textoRespuesta.titulo = 'Ganaste';
		textoRespuesta.subtitulo = 'presiona r para reiniciar';
		textoRespuesta.contador = 0;
	}
	if (textoRespuesta.contador >= 0) {
		textoRespuesta.contador++;
	}
	if ((juego.estado == 'victoria' || juego.estado == 'perdido')&& teclado[82]) {
		juego.estado = 'iniciando';
		nave.estado = 'vivo';
		textoRespuesta.contador = -1;
	};
}
function hit(a,b){ 			// Disparo,enemigo
	var hit = false;
	
	if(b.x + b.width >= a.x && b.x < a.x + a.width)
	{
		if(b.y + b.height >= a.y && b.y < a.y + a.height)
		{
			hit = true;
		}
	}

	if(b.x <= a.x && b.x + b.width >= a.x + a.width)
	{
		if(b.y <= a.y && b.y + b.height >= a.y + a.height)
		{
			hit = true;
		}
	}

	if(a.x <= b.x && a.x + a.width >= b.x + b.width)
	{
		if(a.y <= b.y && a.y + a.height >= b.y + b.height)
		{
			hit = true;
		}
	}

	return hit;
}
function verificarContacto(){
	for(var i in disparos){
		var disparo = disparos[i];
		for (var j in enemigos){
			var enemigo = enemigos[j];
			if (hit(disparo,enemigo)) {
				enemigo.estado='hit';
				enemigo.contador=0;
				console.log('contacto');
			};
		}
	}
	if(nave.estado == 'hit' || nave.estado == 'muerto') return;
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		if(hit(disparo,nave)){
			nave.estado = 'hit';
			console.log('contacto');
		}
	}		
}
function aleatorio(inferior,superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a)
	return parseInt(inferior) + a;
}
function frameLoop(){
	actualizarEstadoJuego();
	moverNave();
	actualizaEnemigos();
	moverDisparos();
	moverDisparosEnemigos();
	dibujarFondo();
	verificarContacto();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujarDisparos();
	dibujaTexto();
	dibujarNave();
}

//Ejecucion de funciones
window.addEventListener('load',init);
function init(){
	agregarEventosTeclado();
	loadMedia();
}