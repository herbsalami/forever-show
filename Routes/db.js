const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = process.env.DB_URL;
const fileUpload = require('express-fileupload');
router.use(fileUpload());

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
		});

		client.close();
		next();
		// db.find({}, (err, items) => {
		// 	console.dir(items);
		// 	res.results = items;
		// 	client.close();
		// 	next();
		// });
	});
};

const createMix = (req, res, next) => {

	if (!req.files)
    	return res.status(400).send('No files were uploaded.');
	let newMix = req.files.newMix;
 
  // Use the mv() method to place the file somewhere on your server
  	newMix.mv(`../Mixes/${newMix.name}`, (err) => {
    if (err)
      return res.status(500).send(err);
    else {
    	next();
    }
  });

}

router.get('/mixes', getMixes, (req, res) => {
	console.dir(res.results);
	res.json({results: res.results});
})

router.put('/mixes', updateOrder, (req, res) => {
	res.json({message: "Well done"});
})

router.post('/mixes', createMix, (req, res) => {
	res.json({message: "Mix Created"});
})

module.exports = router;