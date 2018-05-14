/* 
To Do:
Initialize Mongo db
^^ Have db handle as much preemptive file manipulation/reading as possible
during track upload period
create secret track upload form
*/
require('dotenv').config();
const stream = require('stream');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const header = require('waveheader');
const wavFileInfo = require('wav-file-info');
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const db = require('./Routes/db');
// app.use(express.urlencoded());
app.use(express.json({ extended: true }));
let users = [
	{
		name: 'Dean', 
		username: 'daneagle666',
		password: 'pwdean'
	}, 
	{
		name: 'Paris', 
		username: 'herbsalami',
		password: 'pwparis'
	}, 
	{
		name: 'Rachel', 
		username: 'scatman',
		password: 'pwrachel'
	} 
];

let tracks = [
	{
		id: 'testfile.wav',
		name: 'Mix Volume 1',
		artist: 'Volvox', 
		description: 'A dominant force on the Brooklyn underground scene, Ariana is known for tough, stripped-back techno and groovy, acid-flavored sets. She has been a busy DJ and event producer since 2006 and in that time has shared the decks with many international stars including The Black Madonna, Marcel Dettmann, DVS1, The Hacker, Legowelt and Mike Servito.'

	}, 
	{
		id: 'manhattanP.wav',
		name: 'Manhattan Mix Blah Blah Blah Blah Blah',
		artist: 'PBOY',
		description: 'PBOY Description. Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description Blah blah Description.'
	},
	{
		id: 'maramix.wav', 
		name: 'Half Marathon Mix for Testing',
		artist: 'Yours are the only ears',
		description: `Who is runner them? I'll never tell :)`
	}]


const htmlPath = path.join(__dirname, 'Public');

const getScheduleInfo = (req, res, next) => {
	res.scheduleStart = new Date('March 20, 2018 15:00:00').getTime();
	res.timeStamp = Math.round((Date.now() - res.scheduleStart)/1000);
	next();
}

const getTimeInfo = (req, res, next) => {
	// console.log('Number of Hours Passed: ' + res.timeStamp/3600);
	res.timeStamp = res.timeStamp - (Math.floor((res.timeStamp/3600)) * 3600);
	// console.log('Tracks Length: ' + tracks.length);
	// console.log('Track Name: ' + res.track.artist);
	// console.log('Track TimeStamp: ' + res.timeStamp);
	next();
}

const chooseTrack = (req, res, next) => {
	res.trackIndex = Math.floor((res.timeStamp/3600)) % tracks.length;
	res.track = tracks[res.trackIndex];
	next();
}

const sendSchedule = (req, res, next) => {
	res.schedule = tracks;
	res.send(JSON.stringify({schedule: res.schedule, current: res.trackIndex}));
}

const getFileInfo = (req, res, next) => {
	wavFileInfo.infoByFilename(`../Mixes/${res.track.id}`, function(err, info){
	  	if (err) throw err;
	  	console.dir(info);
	  	res.head = info.header;
	  	res.duration = info.duration;
	  	res.timeStamp = (res.timeStamp)*((res.head.bits_per_sample * 2 * res.head.sample_rate) / 8);
	  	// Below could be a bug
	  	res.setHeader("Content-Type", 'audio/wav');
	  	res.write(header(res.head.sample_rate * res.duration, { bitDepth: res.head.bits_per_sample, channels: 2}))
		next();  	
	});
}

const checkUser = (req, res, next) => {
	// console.log(user.username);
	let verified = false;
	users.forEach((item) => {
		if(item.username === res.user.username && item.password === res.user.password) {
			verified = true;
		}
	})
	if(verified) {
		console.log('Passed');
		next();
	}
	else {
		res.redirect('/login');
	}
	
}

const createToken = (req, res, next) => {
	res.token = jwt.sign({
		data: {
			username: req.body.username,
			password: req.body.password
		}
	}, process.env.JWT_SECRET, { expiresIn: '6h' });
	next();
}

const authenticate = (req, res, next) => {
	jwt.verify(req.query.token, process.env.JWT_SECRET, (err, decoded) => {
		if(err) {
			console.log('error with login');
			res.redirect('/login');
		}
		else {
			console.log('success with login');
			res.user = decoded.data;
			next();
		}
	});
}

const login = (req, res, next) => {
	let user = req.body;
	let verified = false;
	users.forEach((item) => {
		if(item.username === user.username && item.password === user.password) {
			verified = true;
		}
	})
	if(verified) {
		next();
	}
	else {
		res.json({
			error: 'Incorrect Login Info'
		})
	}
}

const setRedirect = (req, res, next) => {
	res.status(301);
	next();
}

const logURL = (req, res, next) => {
	console.log(req.url);
	next();
}


app.get('/music', getScheduleInfo, chooseTrack, getTimeInfo, getFileInfo, (req, res) => {
	console.log('Timestamp ' + Math.round(res.timeStamp));
		let src = fs.createReadStream(`../Mixes/${res.track.id}`, {start: res.timeStamp + 44});
		src.on('data', (chunk) => {
			res.write(chunk);
		})
		src.on('end', () => {
			res.end();
		})
  // src.pipe(res.music);
});

// app.use('/admin/edit', (req, res, next) => {
// 	console.log('redirected');
// 	next();
// }, authenticate, checkUser, express.static(path.join(__dirname, 'Administrator')));

app.use('/admin/page', express.static(path.join(__dirname, 'Administrator')));
app.get('/schedule', authenticate, checkUser, (req, res) => {
	let schedule = [];
	for(let i = 0; i < 25; i++) {
		schedule[i] = {
			position: i,
			name: `Mix Number ${i}`
		}
	}
	res.json(schedule);
});

app.get('/info', getScheduleInfo, chooseTrack, sendSchedule);

app.use('/admin/db', authenticate, db);

app.get('/admin', logURL, authenticate, checkUser, (req, res) => {
	res.redirect('/admin/page');
});

app.get('/login', logURL, (req, res) => {
	res.sendFile(path.join(__dirname, './Public', 'login.html'));
})

app.post('/login', login, logURL, createToken, (req, res, next) => {
	res.json({token: res.token});
})

app.use('/', express.static(htmlPath));




http.listen(port, function(){
  console.log('listening on *:3000');
});
