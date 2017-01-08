var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();
app.set('views', './public');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/data', function(req, res) {
	fs.readFile('./data.json', 'utf8', function(err, data) {
		res.send(JSON.parse(data));
	});
});

app.get('/update', function(req, res) {
	try {
		var crawler = require('./crawler.js');

		res.status(200).send({
			'message': 'Processo de atualização foi inicializado. Verifique o console do servidor e aguarde uns 20 minutos para a atualização'
		});
	} catch(ex) {
		res.status(500).send({
			'message': ex
		});
	}
});

app.listen(8000, function() {
	console.log('Servidor funcionando no endereço: http://localhost:8000');
});