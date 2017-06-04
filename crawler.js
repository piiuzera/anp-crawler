var request  = require('request-promise');
var cheerio  = require('cheerio');
var jsonfile = require('jsonfile');
var mongo    = require('mongodb');

var mongoClient = mongo.MongoClient;

var selSemana 			= '';
var desc_Semana 		= '';
var cod_Semana 			= '';
var tipo 				= '';
var Cod_Combustivel 	= '';

var listState 	= [];
var listFuel 	= [];

var indexState = 0;
var indexFuel  = 0;
var indexCity  = 0;

var getValuesFirstRequest = function(callback) {
	request({
		'uri' : 'http://www.anp.gov.br/preco/prc/Resumo_Por_Estado_Index.asp',
		'encoding': null,
		'method' : 'GET',
		'jar' : true
	}).then(function(data) {
		var $ = cheerio.load(data);

		selSemana   	 = $('input[name=\'selSemana\']')[0].attribs.value;
		desc_Semana 	 = $('input[name=\'desc_Semana\']')[0].attribs.value;
		cod_Semana  	 = $('input[name=\'cod_Semana\']')[0].attribs.value;
		tipo  			 = $('input[name=\'tipo\']')[0].attribs.value;
		Cod_Combustivel  = $('input[name=\'Cod_Combustivel\']')[0].attribs.value;

		var objStates 	= $('#frmAberto > select[name=\'selEstado\'] > option');
		var objFuels 	= $('#selCombustivel > option');

		for(var i = 0; i < objStates.length; i++) {
			var state = objStates[i];
			listState.push({
				'value'   	: state.attribs.value,
				'initial'   : state.attribs.value.split('*')[0],
				'name'    	: state.children[0].data,
				'cities'	: []
			});
		}

		for(var i = 0; i < objFuels.length; i++) {
			var fuel = objFuels[i];

			listFuel.push({
				'value' : fuel.attribs.value,
				'code'  : fuel.attribs.value.split('*')[0],
				'name'  : fuel.children[0].data
			});
		}

		callback(listState, listFuel);

	}).catch(function(ex) {
		console.error(ex);
		throw ex;
	});
};

var getPostRequestStoredCookie = function(state, fuel, callback) {
	request({
		'uri' : 'http://www.anp.gov.br/preco/prc/Resumo_Por_Estado_Index.asp',
		'encoding': null,
		'method': 'POST',
		'jar' : true,
		'form': {
			'selSemana'			: selSemana,
			'desc_Semana'		: desc_Semana,
			'cod_Semana' 		: cod_Semana,
			'tipo' 				: tipo,
			'Cod_Combustivel'	: Cod_Combustivel,
			'selEstado'			: state.value,
			'selCombustivel'	: fuel.value,
			'txtValor'			: ''
		}
	}).then(function(data) {
		callback(state, fuel);
	}).catch(function(ex) {
		console.error(ex);
		throw ex;
	});
};

var getAllCitiesAndPrices = function(state, fuel, callback) {
	request({
		'uri' : 'http://www.anp.gov.br/preco/prc/Resumo_Por_Estado_Municipio.asp',
		'encoding': null,
		'method': 'GET',
		'jar' : true
	}).then(function(data) {
		var $ = cheerio.load(data);

		var rows = $('#box > table[class=\'table_padrao scrollable_table\'] > tr');
		var city = {};
		var averagePriceConsumer 			= '';
		var standardDeviationConsumer 		= '';
		var minPriceConsumer 				= '';
		var maxPriceConsumer 				= '';
		var averageMarginConsumer 			= '';
		var averagePriceDistribution 		= '';
		var standardDeviationDistribution 	= '';
		var minPriceDistribution 			= '';
		var maxPriceDistribution 			= '';

		for(var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if(i > 2) {
				for(var j = 0; j < row.children.length; j++) {
					var cell = row.children[j];
					if(j == 0) {
						var filter = state.cities.filter(function(obj) {
							return obj.name == cell.children[0].children[0].data;
						});

						var value = getValueCity(cell.children[0].attribs.href);

						if(filter.length == 0) {
							city = {
								'value' 		: value,
								'code'			: value.split('*')[0],
								'name' 			: cell.children[0].children[0].data,
								'statistics' 	: [],
								'stations' 		: []
							}
							state.cities.push(city);
						} else {
							city = filter[0];
						}
					} else if(j == 2) {
						averagePriceConsumer = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 3) {
						standardDeviationConsumer = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 4) {
						minPriceConsumer = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 5) {
						maxPriceConsumer = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 6) {
						averageMarginConsumer = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 7) {
						averagePriceDistribution = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 8) {
						standardDeviationDistribution = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 9) {
						minPriceDistribution = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 10) {
						maxPriceDistribution = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					}
				}

				city.statistics.push({
					'type': fuel.name,
					'consumerPrice' : {
						'averagePrice'   	: averagePriceConsumer,
						'standardDeviation' : standardDeviationConsumer,
						'minPrice'  		: minPriceConsumer,
						'maxPrice'  		: maxPriceConsumer,
						'averageMargin'  	: averageMarginConsumer
					},
					'distributionPrice' : {
						'averagePrice'   	: averagePriceDistribution,
						'standardDeviation' : standardDeviationDistribution,
						'minPrice'  		: minPriceDistribution,
						'maxPrice'  		: maxPriceDistribution,
					} 
				});
			}
		}

		callback(state);

	}).catch(function(ex) {
		console.error(ex);
		throw ex;
	});
};

var getStationsByCities = function(state, city, fuel, callback) {
	request({
		'uri': 'http://www.anp.gov.br/preco/prc/Resumo_Semanal_Posto.asp',
		'encoding': null,
		'method': 'POST',
		'jar' : true,
		'form': {
			'cod_semana'		: cod_Semana,
			'desc_semana'		: desc_Semana,
			'cod_combustivel' 	: fuel.code,
			'desc_combustivel' 	: fuel.name,
			'selMunicipio'		: city.value,
			'tipo'				: tipo
		}
	}).then(function(data) {
		var $ = cheerio.load(data);

		var rows = $('.multi_box3 > table[class=\'table_padrao scrollable_table\'] > tr');
		var station = {};

		for(var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if(i > 0) {
				var price = {};
				for(var j = 0; j < row.children.length; j++) {
					var cell = row.children[j];
					if(j == 0) {
						var filter = city.stations.filter(function(obj) {
							return obj.name == cell.children[0].data &&
								   obj.flag == row.children[3].children[0].data;
						});

						if(filter.length == 0) {
							station = {
								'name'   : cell.children[0].data,
								'prices' : []
							};
							city.stations.push(station);
						} else {
							station = filter[0];
						}

					} else if(j == 1) {
						station.address = cell.children[0].data;
					} else if(j == 2) {
						if(cell.children[0].children == null) {
							station.area = '';
						} else {
							station.area = cell.children[0].children[0].data;
						}
					} else if(j == 3) {
						station.flag = cell.children[0].data;
					} else if(j == 4) {
						var filter = station.prices.filter(function(obj) {
							return obj.type == fuel.name;
						});

						if(filter.length == 0) {
							price = {
								'type'		: fuel.name,
								'sellPrice'	: isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.')),
								'buyPrice'	: 0,
								'saleMode'	: '',
								'provider'	: '',
								'date'		: ''
							};
							station.prices.push(price);
						} else {
							price = filter[0];
							price.sellPrice = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
						}
					} else if(j == 5) {
						price.buyPrice = isNaN(cell.children[0].data.replace(',', '.')) ? null : Number(cell.children[0].data.replace(',', '.'));
					} else if(j == 6) {
						price.saleMode = cell.children[0].data;
					} else if(j == 7) {
						price.provider = cell.children[0].data;
					} else if(j == 8) {
						price.date = getFormatDate(cell.children[0].data);
					}
				}
			}
		}
		callback(state, city, fuel);
	}).catch(function(ex) {
		console.error(ex);
		throw ex;
	});
};

function crawler() {
	if(indexState < listState.length) {
		var state = listState[indexState];
		var fuel = listFuel[indexFuel];

		getPostRequestStoredCookie(state, fuel, function(state, fuel) {
			getAllCitiesAndPrices(state, fuel, function(state) {
				indexFuel += 1;
				if(indexFuel >= listFuel.length) {
					indexState += 1;
					indexFuel = 0;

					console.log('-- ' + state.name + ' - OK');
				}

				crawler();
			});
		});
	} else {
		indexState = 0;
		indexFuel = 0;

		console.log('');
		console.log('---');
		console.log('Stations');
		console.log('---');
		console.log('');

		stations();
	}
}

function stations() {
	if(indexState < listState.length) {
		var state = listState[indexState];
		var fuel = listFuel[indexFuel];
		var city = state.cities[indexCity];

		getStationsByCities(state, city, fuel, function(state, city, fuel) {
			indexFuel += 1;
			if(indexFuel >= listFuel.length) {
				indexCity += 1;
				indexFuel = 0;

				console.log('-- ' + state.initial + ' - ' + city.name + ' - OK');
			}

			if(indexCity >= state.cities.length) {
				indexState += 1;
				indexCity = 0;
			}

			stations();
		});
	} else {
		jsonfile.spaces = 4;
		jsonfile.writeFileSync('./data.json' , listState);

		console.log('---');
		console.log('JSON File Changed');
		console.log('---');

		console.log('---');
		console.log('Finish');
		console.log('---');
	}
}

var init = function() {
	getValuesFirstRequest(function() {
		indexState = 0;
		indexFuel = 0;
		indexCity = 0;

		console.log('---');
		console.log('States and Cities');
		console.log('---');

		crawler();
	});
};

module.exports.Init = init;

function getValueCity(attr) {
	attr = attr.replace('javascript:Direciona(\'', '');
	attr = attr.replace('\');', '');

	return attr;
}

function getFormatDate(date) {
	var year = date.split('/')[2];
	var month = date.split('/')[1];
	var day = date.split('/')[0];

	return year + '-' + month + '-' + day;
}