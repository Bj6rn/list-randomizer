<script>
	let mainview = true;
	let modal = false;
	let activeList = {id: "", name: "", items: []};
	let randomDraw = {id: "", name: "", stats: ""};
	let lists = [];
	
	//call to read the database on app start
	window.api.readListsData();

	//refreshes the data if there was a change in the database
	window.api.onListsData((data) => {
		lists = data;
	});

	//refreshes the active list if there was a change in the database
	window.api.refreshActiveList((data) => {
		activeList = data;
	});
	
	function addList() {
		let usertext = document.querySelector("#usertext").value
        document.querySelector("#usertext").value = "";
		
		window.api.addList( { name: usertext, items: [] } );
	}

	function openList(list) {
		activeList.id = list.id;
		activeList.name = list.name;
		activeList.items = list.items;
		mainview = false;
	}

	function removeList(list) {
		window.api.deleteList(list.id);
		Snackbar.show({
			text: `List "${list.name}" got deleted!`,
			actionText: 'undo',
			actionTextColor: '#33b96b',
			backgroundColor: '#243038',	
			duration: 3000,
			onActionClick: (element) => {
				element.style.opacity = 0;
				//adds complete list back to database
				window.api.addList( { name: list.name, items: list.items } );
			} 
		});
	}

	function goback() {
		mainview = true;
	}

	function getRandom(list) {
		//if list contains no items, you get a error message
		if (list.items.length < 1) {
			Snackbar.show({
				text: `List "${list.name}" is empty!`,
				showAction: false,
				backgroundColor: '#243038',	
				duration: 2000
			});
			return
		}
		let listLength = list.items.length;
		let array = list.items;
		
		//picks one element out of the array with a pseudo random int between 0 and array.length (min/max included)
		let randomInt = Math.floor(Math.random() * listLength);
		let randomItem = array[randomInt];

		modal = "showRandom";
		randomDraw = {id: randomItem.id, name: randomItem.name, stats: listLength}
	}

	function addItem(listId) {
		let usertext = document.querySelector("#usertext").value
        document.querySelector("#usertext").value = "";
		
		window.api.addItem( listId, {name: usertext} );
	}

	function deleteItem(listId, item) {
		window.api.deleteItem(listId, item.id);
		Snackbar.show({
			text: `Item "${item.name}" got deleted!`,
			actionText: 'undo',
			actionTextColor: '#33b96b',
			backgroundColor: '#243038',	
			duration: 3000,
			onActionClick: (element) => {
				element.style.opacity = 0;
				//adds item back to database
				window.api.addItem( listId, {name: item.name} );
			} 
		});
	}

	function closeModal() {
		modal = false;
	}

</script>


{#if mainview}
	<nav>
		<h1 class="headline">list-randomizer</h1>
		<form id="add-list-form" on:submit|preventDefault={addList}>
			<input type="text" id="usertext" placeholder="Add new list..." autocomplete="off" required>
			<input type="image" class="button" value="Add" src="img/add_white_24dp.svg" alt="Add">
		</form>  
	</nav>
	<ul id="list-overview">
		{#each lists as list_obj}
			<li>
				<span class="list-text">{list_obj.name}</span>
				<div class="open-btn button" on:click={openList(list_obj)}>
					<img src="img/open_in_new_white_24dp.svg" alt="open list">
				</div>
				<div class="remove-btn button" on:click={removeList(list_obj)}>
					<img src="img/delete_forever_white_24dp.svg" alt="delete list">
				</div>
			</li>
		{:else}
			<li><span class="list-text">Nothing here!</span></li>
		{/each}
	</ul>
{:else}
	<nav>
		<h1 class="headline">{activeList.name}</h1>
		<div class="btn-container">
			<div id="randomize-btn" class="button" title="draw random" on:click={getRandom(activeList)}>
				<img src="img/dice_white_24dp.svg" alt="draw random">
			</div>
			<div id="go-back-btn" class="button" title="go back" on:click={goback}>
				<img src="img/arrow_back_white_24dp.svg" alt="go back">
			</div>
		</div>
	</nav>
	<ul id="item-overview">
		<li>
			<form id="add-item-form" on:submit|preventDefault={addItem(activeList.id)}>
				<input type="text" id="usertext" placeholder="Add new item..." autocomplete="off" required>
				<input type="image" class="item-btn" value="Add" src="img/add_white_24dp.svg" alt="Add">
			</form>
		</li>
		{#each [...activeList.items].reverse() as item}
			<li>
				<span id="item{item.id}">{item.name}</span>
				<div class="item-btn" title="delete" on:click={deleteItem(activeList.id, item)}>
					<img src="img/delete_forever_white_24dp.svg" alt="delete">
				</div>
			</li>
		{/each}
		
	</ul>
{/if}
{#if modal == "showRandom"}
	<section id="modal-section">
		<div class="loader"></div>
		<div class="modal">
			<h4 id="category">{activeList.name}</h4>
			<h1 id="winnerItem">{randomDraw.name}</h1>
			<h4 id=stats>winner out of [{randomDraw.stats}]</h4>
			<div class="close-btn button" on:click={closeModal}>
				close
			</div>
		</div>
	</section>
{/if}
