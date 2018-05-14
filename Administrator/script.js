let mixes = [];
if(!sessionStorage.getItem('foreverShowBearerToken')) {
	document.getElementById('main').innerHTML = '<h1> PLEASE LOGIN <a href="/login">HERE</a> TO VIEW THIS PAGE </h1>';
}
else {

	const showSpinner = () => {
		document.getElementById('mask').style.display = 'flex';
	}
	const hideSpinner = () => {
		document.getElementById('mask').style.display = 'none';
	}
	const saveListOrder = () => {
		showSpinner();
		let content = Array.from(document.getElementsByClassName('list-group-item')).map((item, index) => {
				return {
					id: item.getAttribute('data-value'),
					index
				}
			});
		fetch(`/admin/db/mixes?token=${sessionStorage.getItem('foreverShowBearerToken')}`, {
			headers: {
				"Content-Length": content.length.toString(),
				"Content-Type": "application/json"
			},
			method: 'PUT', 
			body: JSON.stringify(content)
		}).then(response => response.json())
		.then((data) => {
			console.dir(data);
			hideSpinner();
		})
	};

	const deleteChildren = () => {
		let list = document.getElementById('simpleList')
		while (list.firstChild) {
	    		list.removeChild(list.firstChild);
			}
		return list;
	}

	const createList = () => {
		let list = document.createElement('ul');
		list.className = 'list-group';
		list.id = 'simpleList';
		return list;
	}

	const getMixes = () => {
		showSpinner();
		let list = document.getElementById('simpleList') ? deleteChildren() : createList();
		fetch(`/admin/db/mixes?token=${sessionStorage.getItem('foreverShowBearerToken')}`)
		.then(response => response.json())
		.then((data) => {
			data.results.sort((a, b) => {
				if(a['index'] < b['index']) {
					return -1;
				}
				else {
					return 1;
				}
			}).forEach((item, index) => {
				mixes.push(item);
				let mix = document.createElement('li');
				mix.setAttribute('data-value', item._id);
				mix.className = 'list-group-item';
				mix.innerHTML = `<h7>${item.name}</h7> <div><h9>${item.artist}</h9></div>`;
				list.appendChild(mix);
				console.dir(mix);
			})
			document.getElementById('schedule').appendChild(list);
			console.dir(mixes);
			let sortable = Sortable.create(simpleList);
			hideSpinner();
		})
	}
	getMixes();
	let button = document.createElement('button');
	button.id = 'print';
	button.innerHTML = 'Save Schedule Order';
	document.getElementById('schedule-section').appendChild(button);
	document.getElementById('print').addEventListener('click', saveListOrder);

}

