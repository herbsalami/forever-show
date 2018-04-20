if(!sessionStorage.getItem('foreverShowBearerToken')) {
	document.getElementById('main').innerHTML = '<h1> PLEASE LOGIN <a href="/login">HERE</a> TO VIEW THIS PAGE </h1>';
}