const config = {
	r: {
		path: 'C:/Program Files/R/R-3.3.2/bin/x64/R.exe',
		threadCount: 2,
		concurrency: 1
	},
	data: {
		root: {path: "C:/Development/github/TopicAnalysis/data/"}
	}
};

const router = require('express').Router();
const _ = require('lodash');
var computer  = require('computer');
var csv = require('csv-string');
var queue = require("queue");

if (false) {
	var R = new computer('C:/Program Files/R/R-3.3.2/bin/x64/R.exe', 2);
	//Start an R process and leave it running.
	R.start(function(){});
}
var q = queue({concurrency: 1});

var dataLoaded = [];

function loadData(client, folder, file, date) {
	var path = config.data.root.path+client+"/"+folder+"/"+file+"_"+date+".Rdata";
	if (dataLoaded.indexOf(file) == -1) {
		q.push(function (cb) {
			R.run("df <- load(\""+path+"\")", function(err, response) {
				if (err) {console.log(err);}
				dataLoaded.push(file);
				cb();
			});
		});
//		q.push(function (cb) {
//			R.run("save(df, file = \""+(config.data.root.path+client)+"/abc.RData\")", function(err, response) {
//				console.log("saved to "+(config.data.root.path+client)+"/abc.RData");
//				console.log(err);
//				console.log(response);
//				cb();
//			});
//		});
	};
}

function getObject(name, done) {
	var data;
	q.push(function (cb) {
		R.run("write.csv("+name+")", function(err, response) {
			data = csv.parse(response);
			cb();
		});
	});
	if (done) {
		q.start(function(err) {
			done(data);
		});
	}
}

var objectCollection = function() {
	this.objects = {};
};
objectCollection.prototype.add = function (name, rowCount, colNames) {
	this.objects[name] = {
		rowCount: rowCount,
		colNames: colNames
	};
};
objectCollection.prototype.get = function () {
	return this.objects;
};

router.get('/:client/:folder/:file/:date/objects', function(req, res, next) {
	loadData(req.params.client, req.params.folder, req.params.file, req.params.date);
	getObject("df", function(rows) {
		//Each row in the df object is a key/value pair, the value is the name of an object in the RData file
		var objects = new objectCollection();
		rows.filter(function(row) {
			return row[0] != "";//Remove the object named x;
		}).map(function(row) {
			return row[1];//Get the object name
		}).forEach(function(objName) {
			console.log(objName);
			return;
			q.push(function(cb) {
				R.run("write(paste('{\"rowCount\":',nrow("+objName+"),',\"colNames\":[',capture.output(write.csv("+objName+"[0,])),']}'),'')", function(err, response) {
					data = JSON.parse(response);
					objects.add(objName, data.rowCount, data.colNames);
					cb();
				});
			});
		});
		q.start(function(err) {
			var links = _.transform(objects.get(), function(r, v, k) {
				r[k] = "api/"+req.params.client+"/"+req.params.file+"/objects/"+k;
			}, {});
			return res.hal({
//				data : {objects: objects},
				data : {objects: objects.get()},
				links : links
			});
		});
	});
});

router.get('/:client/:file/objects/:obj', function(req, res, next) {
	loadData(req.params.client, req.params.file);
	getObject(req.params.obj, function(rows) {
		var startRow = Number(req.query.row || 1);
		var rowCount = Number(req.query.count || rows.length-1);
		return res.json({
			cols: rows[0],
			rows: rows.slice(startRow, startRow+rowCount+1)
		});
	});
});

module.exports = router;
