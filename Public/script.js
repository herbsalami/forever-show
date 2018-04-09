const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

let fadeInID;
let fadeOutID;
let oldPlayer;
let player;
let circle1;
let circle2;

const toggle = () => {
		let el = document.getElementById('button').childNodes[1];
		if (player.muted || player.volume == 0) {
			el.id = 'pause';
			player.muted = false;
			player.volume = 1;
		}
		else {
			el.id = 'play';
			player.muted = true;
		}
		
}



const loadContent = () => {

	player = new Audio('./music');
	player.volume = 0;
	player.autoplay = true;
	player.oncanplay = player.play();
	let fadeIn = () => {
		// console.log(player.volume);
		if(player.volume <= 0.9) {
			player.volume += 0.1;
		}
		else {
			player.volume = 1;
			// console.log(player.volume);
			clearInterval(fadeInID);
		}
		return;
	}
	if(document.getElementById('pause')) {
		fadeInID = setInterval(fadeIn, 400);
	}
	// console.dir(player);
	document.getElementById('button').removeEventListener('click', toggle, true);
	document.getElementById('button').addEventListener('click', toggle, true);
	document.body.onkeyup = (e) => {
	    if(e.keyCode == 32){
	        toggle()
	    }
	}
	let seconds = new Date().getSeconds();
	let minutes = new Date().getMinutes();
	// grabMoreContent((30 * 1000));
	grabMoreContent((3600 - (seconds + (minutes * 60))) * 1000);
	getInformation();
}

const getInformation = () => {
	fetch('./info').then(response => response.json())
	.then((data) => {
		updateInfo(data);
	})
}

const playbackSwitch = () => {
	// console.log('playbackswitch');
	if (oldPlayer) {
		let fadeOut = () => {
			// console.log(oldPlayer.volume);
			if(oldPlayer.volume >= 0.1) {
				oldPlayer.volume -= 0.1;
			}
			else {
				oldPlayer.volume = 0;
				// console.log(oldPlayer.volume);
				clearInterval(fadeOutID);
			}
			return;
		}
		fadeOutID = setInterval(fadeOut, 400);
	}
}

const updateInfo = (information) => {
	let currentTrack = information.schedule[information.current];
	document.getElementById('artist').innerHTML = currentTrack.artist;
	document.getElementById('track').innerHTML = currentTrack.name;
	document.getElementById('info-item').innerHTML = currentTrack.description;
	document.getElementById('schedule').innerHTML = updateSchedule(information);
	// if (circle1) {
	// 	circle1.refresh();
	// }
	// if(circle2) {
	// 	circle2.refresh();
	// }
	// circle1 = new CircleType(document.getElementById('track')).dir(-1).radius(300);
	// circle2 = new CircleType(document.getElementById('artist')).radius(300);
	// circle1.refresh();
	// circle2.refresh();
	// circle1 = new CircleType(document.getElementById('track')).dir(-1).radius(parseInt(window.getComputedStyle(document.getElementById('track')).height) + 150);
	// circle2 = new CircleType(document.getElementById('artist')).radius(parseInt(window.getComputedStyle(document.getElementById('artist')).height) + 150);
	// circle1.refresh();
	// circle2.refresh();
	// adjustRotations();

}

const adjustRotations = () => {
	let trackText = document.getElementById('track');
	let artistText = document.getElementById('artist');
	setTimeout(() => {
		console.log('artist: ')
		artistText.style.top = `calc(37.5% - 75px - ${window.getComputedStyle(artistText).height} /2)`
		trackText.style.top = `calc(37.5% + 75px - ${window.getComputedStyle(trackText).height} /2)`
		console.dir(artistText.top)
		console.log('track: ')
		console.dir(trackText.top)
	}, 1)
}

const updateSchedule = (data) => {
	let currentHour = new Date().getHours();
	let currentIndex = data.current;
	let schedule = data.schedule;
	let text = ''; 
	let hours = 1;
	let time;
	for(i = 0; i <= 23; i++) {
		currentIndex >= schedule.length - 1 ? currentIndex = 0 : currentIndex += 1;
		time = currentHour + hours;
		text += `<div class="schedule-item" style="color:rgba(255,245,238,${1 - (i/24)}); border-left: 25px solid rgba(255,245,238,${1 - (i/24)});">${(time) > 9 ? time : '0' + time}:00 - ${schedule[currentIndex].artist}</div>`;
		hours + currentHour >= 23 ? hours = 0 - currentHour : hours += 1;
	}
	return text;
}
// rgba(255,245,238,1)

const grabMoreContent = (timeTo) => {
	setTimeout(() => {
		oldPlayer = player;
		// console.dir(oldPlayer);
		playbackSwitch();
		loadContent();
	}, timeTo);
}

if (isSafari) {

        document.getElementById('button').innerHTML = 'Sorry! Safari is not supported.';
        document.getElementById('schedule').innerHTML = 'Not yet anyway.';
        document.getElementById('info').innerHTML = 'Soon though! We hope!';
}
else {
	loadContent();
}


