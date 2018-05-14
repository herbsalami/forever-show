const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = process.env.DB_URL;

router.use(express.json({ extended: true }));


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

const updateOrder = (req, res, next) => {
	console.log('updating');
	MongoClient.connect(url, function(err, client) {
		console.log("Connected correctly to server");

		const db = client.db('foreverDB').collection('mixes');

		req.body.forEach((item) => {
			db.updateOne({_id: (new mongo.ObjectID(item.id))}, {$set: {index: item.index}}, (err, result) => {
				console.dir(result);
			})
		}, () => {
			client.close();
			next();
		});


		// db.find({}, (err, items) => {
		// 	console.dir(items);
		// 	res.results = items;
		// 	client.close();
		// 	next();
		// });
	});
};

router.get('/mixes', getMixes, (req, res) => {
	console.dir(res.results);
	res.json({results: res.results});
})

router.put('/mixes', updateOrder, (req, res) => {
	res.json({message: "Well done"});
})

module.exports = router;