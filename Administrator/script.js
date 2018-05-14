if(!sessionStorage.getItem('foreverShowBearerToken')) {
	document.getElementById('main').innerHTML = '<h1> PLEASE LOGIN <a href="/login">HERE</a> TO VIEW THIS PAGE </h1>';
}
else {
	let list = document.createElement('ul');
	list.className = 'list-group';
	list.id = 'simpleList';
	fetch(`/admin/db/mixes?token=${sessionStorage.getItem('foreverShowBearerToken')}`)
	.then(response => response.json())
	.then((data) => {
		data.results.forEach((item, index) => {
			let mix = document.createElement('li');
			mix.setAttribute('data-value', index)
			mix.className = 'list-group-item';
			mix.innerHTML = `<h7>${item.name}</h7>`;
			list.appendChild(mix);
			console.dir(mix);
		})
		document.getElementById('main').appendChild(list);
		let sortable = Sortable.create(simpleList);
		let button = document.createElement('button');
		button.id = 'print';
		button.innerHTML = 'Print List';
		document.getElementById('main').appendChild(button);
		document.getElementById('print').addEventListener('click', () => {
			console.dir(sortable.toArray());
		});
	})

}

