const stream = require('stream');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const header = require('waveheader');
const wavFileInfo = require('wav-file-info');
let tracks = [
	{
		id: 'testfile.wav',
		name: 'Mix Volume 1',
		artist: 'Volvox', 
		description: 'A dominant force on the Brooklyn underground scene, Ariana is known for tough, stripped-back techno and groovy, acid-flavored sets. She has been a busy DJ and event producer since 2006 and in that time has shared the decks with many international stars including The Black Madonna, Marcel Dettmann, DVS1, The Hacker, Legowelt and Mike Servito.',
		trackList: [ 
			{
				start: '0:00',
				end: '1:50',
				title: 'My First Mix',
				artist: 'DJ Hoon'
			},
			{
				start: 'yea'
			}]

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
	res.scheduleStart = new Date('March 20, 2018 13:00:00').getTime();
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
	  	res.head = info.header;
	  	res.duration = info.duration;
	  	res.timeStamp = (res.timeStamp)*((res.head.bits_per_sample * 2 * res.head.sample_rate) / 8);
	  	// Below could be a bug
	  	res.setHeader("Content-Type", 'audio/wav');
	  	res.write(header(res.head.sample_rate * res.duration, { bitDepth: res.head.bits_per_sample, channels: 2}))
		next();  	
	});
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

app.get('/info', getScheduleInfo, chooseTrack, sendSchedule);

app.use('/', express.static(htmlPath));


http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});
