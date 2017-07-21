const router = require('express').Router();
const fs = require('fs');

router.get('/:filename*', function(req, res, next) {
	var options = {
		root: '../../'
	};

	var path = req.params.filename;
	if (req.params.hasOwnProperty("0")) {
		path += req.params[0];
	}
	res.sendFile(path, options, function(err) {
		if (err) {
			console.log(err);
			res.status(err.status).end();
		}
		else {
			console.log('Sent:', path);
		}
	});
});

module.exports = router;
