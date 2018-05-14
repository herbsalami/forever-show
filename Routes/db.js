const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL;

const getMixes = (req, res, next) => {
	MongoClient.connect(url, function(err, client) {
		console.log("Connected correctly to server");

		const db = client.db('foreverDB').collection('mixes');
		res.results = [];

		db.find({}).toArray((err, result) => {
			if (err) throw err;
		    res.results = result;
		    client.close();
		    next();
		})

		// db.find({}, (err, items) => {
		// 	console.dir(items);
		// 	res.results = items;
		// 	client.close();
		// 	next();
		// });
	});
}

router.get('/mixes', getMixes, (req, res) => {
	console.dir(res.results);
	res.json({results: res.results});
})

module.exports = router;