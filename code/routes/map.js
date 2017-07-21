// docker.js
const router = require('express').Router();
const fs = require('fs');
const parse = require('csv-parser');
const _ = require('lodash');

function getData(cb) {
	var data={
		topics: [],
		total: {}
	};
	fs.createReadStream("../data/capella/StateTopicindex_8-26.psv")
		.pipe(parse({separator: '|'}))
		.on('data', function(row) {
			var topic = _.pick(row, ["topicWords", "hits"]);
			topic.state = _.transform(row, function(result, value, key) {
				var match = key.match(/^StateAbbrev.(hits)(.+)/);
				if (match != null) {
					result[match[2]] = {hits: Number(value)};
					if (data.total.hasOwnProperty([match[2]])) {
						data.total[match[2]] += Number(value);
					} else {
						data.total[match[2]] = Number(value);
					}
				}
				return result;
			}, {});
			

			genderKeyMap = {"M": "male", "F": "female", "U": "unknown"};
			topic.gender = _.transform(row, function(result, value, key) {
				var match = key.match(/^CallerGender.(hits)(.+)/);
				if (match != null) {
					result[genderKeyMap[match[2]]] = {hits: value};
				}
				return result;
			}, {});

			data.topics.push(topic);
		})
		.on('end',function() {
			cb(data);
		})
	;
}

router.get('/:data', function(req, res, next) {
	switch (req.params.data) {
		case "topics":
			getData(function(data) {
				return res.json({
					total: data.total,
					topics: data.topics.map(function(topic) {
						return _.pick(topic, ["topicWords", "hits", "state"]);
					})
				});
			});
			break;
	}
});


module.exports = router;
