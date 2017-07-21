const router = require('express').Router();
const fs = require('fs');

router.get('/:app/:view', function(req, res, next) {
	var options = {
		root: '../../'
	};
console.log(req.params);

	var path = req.params.app+"/view/"+req.params.view;
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
