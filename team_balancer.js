var api_url = "https://api.wiseoldman.net/players/track";
let numUsers = 0;


async function sendPlayerDataPromise(playerList) {
	let promises = [];
	let aborted = false;
	for (player in playerList) {
		document.getElementById("infoPanel").innerHTML = "Loading Player (" + player.toString() + "/" + playerList.length.toString() + ")";
		let data = "{\"username\":" + "\"" +  playerList[player] + "\"" + "}";
		let xhr = new XMLHttpRequest();
		xhr.open("POST", api_url);
		xhr.setRequestHeader("Content-Type", "application/json");
		const promise = new Promise((resolve, reject) => {
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if ([200, 201].includes(xhr.status)) {
						let username = JSON.parse(xhr.responseText).displayName;
						let res = JSON.parse(xhr.responseText);
						clearInterval(timeout);
						return resolve(createPlayerObj(username, res));
					}
					else {
						console.log(xhr.responseText);
						aborted = true;
						return resolve(undefined);
					}
				}
			}
		});
		xhr.send(data);
		const timeout = setTimeout(() => {
			aborted = true;
			xhr.abort();
		}, 5000);
		
		promises.push(promise);
	}
	
	if (aborted)
		return [];
	else
		return await Promise.all(promises).then(r => r).catch(error => {console.log(error)});

}


function createPlayerObj(player_name, response) {
	jsonRes = response.latestSnapshot;
	const player = {
		name: player_name
	};
	for (const key2 in pvm_scale2)
		player[key2] = 0;
	for (const key in jsonRes) {
		for (const key2 in pvm_scale2) {
			//console.log(pvm_scale2[key2].bosses);
			if (pvm_scale2[key2].bosses.includes(key))
				player[key2] += jsonRes[key].ehb;
		}
	}
	player['ehp'] = jsonRes['ehp'].value;
	//console.log(player);
	return player;
}

function findPlayerinList(name, list) {
	for (player in list) {
		if (name == list[player].name)
			return true;
	}
	return false;
}	


function sendPlayerDataFake(playerList) {
	let players = [];
	for (var player in playerList) {
		//if (!findPlayerinList(playerList[player].toLowerCase(), players)) {
			const player_obj = {
				name: playerList[player]
			};
			for (const key in pvm_scale2) {
				//console.log(key);
				player_obj[key] = Math.random() * 1000;
			}
			//console.log(player_obj);
			players.push(player_obj);
		//}
		//else
			//console.log("player already in list!");
	}
	return players;
}


function createFinalTeamTable(teams) {
	//let teams = teams.slice();
	//console.log(teams);
	let table = document.getElementById("finalTeamTable");
	removeAllChildNodes(table);
	let headerRow = document.createElement("tr");
	for (let i = 0; i < teams.length; i++) {
		let thisHeader = document.createElement("th");
		thisHeader.className = "teamTableCell";
		thisHeader.innerHTML = "Team " + (i + 1);
		headerRow.appendChild(thisHeader);
	}
	table.appendChild(headerRow);
	for (let i = 0; i < getLongestTeam(teams); i++) {
		let newRow = document.createElement("tr");
		for (let j = 0; j < teams.length; j++) {
			let newCol = document.createElement("td");
			newCol.className = "teamTableCell";
			if (teams[j].players[i] != undefined)
				newCol.innerHTML = teams[j].players[i];
			newRow.appendChild(newCol);
		}
		table.appendChild(newRow);
	}
	
}

function getLongestTeam(teams) {
	let longest = 0;
	for (i in teams) {
		if (teams[i].players.length > longest)
			longest = teams[i].players.length;
	}
	return longest;
}


function removeAllChildNodes(element) {
	while (element.firstChild)
		element.removeChild(element.firstChild);
}


function createPVMSliders(pvm_obj) {
	let container = document.getElementById("sliderContainer");
	for (index in pvm_obj) {
		let row = document.createElement("tr");
		let cell = document.createElement("td");
		let slider = document.createElement("input");
		slider.setAttribute("id", index + "-slider");
		slider.setAttribute("name", "pvmSlider");
		slider.setAttribute("type", "range");
		slider.setAttribute("min", "0");
		slider.setAttribute("max", "100");
		slider.setAttribute("value", "100");
		slider.addEventListener("change", function() {
			updateSliderVal(slider.id.split("-")[0]);
		});
		let valLabel = document.createElement("input");
		valLabel.setAttribute("value", slider.value / 100);
		valLabel.setAttribute("name", "pvmWeightVal");
		valLabel.setAttribute("id", slider.id + "-valLabel");
		valLabel.setAttribute("size", "1");
		valLabel.addEventListener("change", function() {
			updateSliderPos(valLabel.id.split("-")[0]);
		});
		let label = document.createElement("label");
		label.setAttribute("for", slider.id);
		label.innerHTML = "&ensp;" + pvm_scale2[index].label;
		cell.appendChild(slider);
		cell.appendChild(valLabel);
		cell.appendChild(label);
		row.appendChild(cell);
		container.appendChild(row);
	}
	let height = container.offsetHeight;
	//console.log(height);
	document.getElementById("playerContainer").style.height = height.toString() + "px";
	//document.getElementById("finalTeamTable").style.height = height.toString() + "px";
}

function updateSliderVal(id) {
	let val = document.getElementById(id + "-slider").value;
	document.getElementById(id + "-slider-valLabel").value = val / 100;
}

function updateSliderPos(id) {
	let val = document.getElementById(id + "-slider-valLabel").value;
	if (val < 0)
		val = 0;
	if (val > 100)
		val = 100;
	if (isNaN(val))
		val = 1;
	document.getElementById(id + "-slider").value = val * 100;
	document.getElementById(id + "-slider-valLabel").value = val;
}

function createWeightObj() {
	let vals = document.getElementsByName("pvmWeightVal");
	let weightObj = {};
	for (let i = 0; i < vals.length; i++) {
		//console.log(vals[i].id, vals[i].value);
		weightObj[vals[i].id.split("-")[0]] = parseFloat(vals[i].value);
	}
	//console.log(weightObj);
	return weightObj;
}

function createTeamDropdown() {
	let numUsers = document.getElementById("playerContainer").childElementCount;
	//console.log(numUsers);
	let dropdown = document.getElementById("teamSizeSelect");
	removeAllChildNodes(dropdown);
	for (let i = 1; i <= numUsers; i++) {
		const option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = i;
		dropdown.appendChild(option);
	}
	/*dropdown.addEventListener("change", function() {
		createTeamNameInput();
	});*/
}

function createTeamNameInput() {
	let dropdown = document.getElementById("teamSizeSelect");
	let dropdown_selected = dropdown.options[dropdown.selectedIndex].value;
	let teamNameTable = document.getElementById("teamNameTable");
	removeAllChildNodes(teamNameTable);
	for (let i = 0; i < dropdown_selected; i++) {
		let row = document.createElement("tr");
		let cell = document.createElement("td");
		let textInput = document.createElement("input");
		textInput.setAttribute("placeholder", "Team " + (i + 1).toString() + " Name");
		cell.appendChild(textInput);
		row.appendChild(cell);
		teamNameTable.appendChild(row);
	}
}

function createUserInput() {
	const playerDiv = document.createElement("div");
	const removeButton = document.createElement("input");
	removeButton.setAttribute("type", "button");
	removeButton.setAttribute("value", "x");
	removeButton.className = "playerRemoveButton";
	const input = document.createElement("input");
	input.setAttribute("type", "text");
	numUsers++;
	playerDiv.setAttribute("id", "playerDiv" + numUsers);
	removeButton.onclick = function() { removeUserInput(playerDiv.id); };
	input.setAttribute("name", "usernameInput");
	input.setAttribute("id", "usernameInput" + numUsers);
	//input.setAttribute("placeholder", (numUsers + 1).toString());
	input.className = "playerTextBox";
	//removeButton.style.height = (input.style.height).toString() + "px";
	playerDiv.appendChild(removeButton);
	playerDiv.appendChild(input);
	//playerDiv.style.outline = "1px solid #0000FF";
	document.getElementById("playerContainer").appendChild(playerDiv);
	createTeamDropdown();
	let scrollElement = document.getElementById("playerContainer");
	scrollElement.scrollTop = scrollElement.scrollHeight;
}

function initUserList(amt) {
	for (let i = 0; i < amt; i++)
		createUserInput();
}

function removeUserInput(id) {
	document.getElementById(id).remove();
	createTeamDropdown();
}

function getPlayerNames() {
	let elements = document.getElementsByName("usernameInput");
	names = [];
	for (i = 0; i < elements.length; i++) {
		if (elements[i].value != "")
			names.push(elements[i].value.toLowerCase());
	}
	//console.log(names);
	return names;
}


function sortPlayers(players, weightObj) {
	
	let score_obj = {};
	for (const key in players[0])
		if (key != 'name')
			score_obj[key] = 0;
	
	for (let i = 0; i < players.length; i++) {
		for (const key in players[i]) {
			if (key != 'name')
				score_obj[key] += players[i][key];
		}
	}
	for (const key in score_obj)
		score_obj[key] /= players.length;
	
	//console.log(score_obj);
	
	for (let i = 0; i < players.length; i++)
		players[i].tot_score = 0;
	for (let i = 0; i < players.length; i++) {
		let tot = 0;
		for (const key in score_obj) {
			if (score_obj[key] != 0) {
				if (key in weightObj)
					tot += (players[i][key] / score_obj[key]) * weightObj[key];
				else
					tot += (players[i][key] / score_obj[key]);
			}
			else
				tot += 0;
		}
		players[i].tot_score = tot;
	}
	
	//console.log(players);
	
	return players.sort(function(a, b) {
		if (a.tot_score > b.tot_score)
			return -1;
		else if (a.tot_score < b.tot_score)
			return 1;
		else
			return 0;
	});
}

function disableCreate(disableTarget, secsDisabled) {
	let timeLeft = secsDisabled;
	let storedText = disableTarget.innerText;
	disableTarget.disabled = true;
	let x = setInterval(function() {
		disableTarget.innerText = storedText + " (" + timeLeft + ")";
		timeLeft--;
		if (timeLeft < 0) {
			clearInterval(x);
			disableTarget.innerText = storedText;
			disableTarget.disabled = false;
		}
	}, 1000);
}


function getSmallestBucket(buckets, teamSize) {
	let smallestIndex = 0;
	let smallestAmt = Number.MAX_SAFE_INTEGER;
	for (let i = 0; i < buckets.length; i++) {
		if (buckets[i].players.length == teamSize)
			continue;
		if (buckets[i].score < smallestAmt) {
			smallestAmt = buckets[i].score;
			smallestIndex = i;
		}
	}
	return smallestIndex;
}

function getNextBucket(buckets, teamSize) {
	let lowestSize = Number.MAX_SAFE_INTEGER;
	let lowestIndex = 0;
	for (let i = 0; i < buckets.length; i++) {
		let dist = buckets[i].players.length - teamSize;
		let pointsPerPlayer = dist / buckets[i].players.length;
		if (dist < lowestSize) {
			lowestSize = dist;
			lowestIndex = i;
		}
	}
	if (lowestSize >= 1)
		return lowestIndex;
	else
		return getSmallestBucket(buckets, teamSize);
}

function pickTeamsBucketSort(sortedPlayers, num_teams) {
	let final_teams = [];
	let teamSize = Math.min(sortedPlayers.length / num_teams);
	for (let i = 0; i < num_teams; i++)
		final_teams[i] = {players:[], score:0};
	for (let i = 0; i < sortedPlayers.length; i++) {
		if (i < num_teams) {
			final_teams[i].players.push(sortedPlayers[i].name);
			final_teams[i].score += sortedPlayers[i].tot_score;
		}
		else {
			final_teams[getNextBucket(final_teams, teamSize)].players.push(sortedPlayers[i].name);
			final_teams[getNextBucket(final_teams, teamSize)].score += sortedPlayers[i].tot_score;
		}
	}
	//console.log(final_teams);
	return final_teams;
}

function getPlayerAvg(players) {
	let tot_score = 0;
	for (player in players) {
		tot_score += players[player].raids;
	}
	let avg_score = tot_score / players.length;
	return avg_score;
}


createPVMSliders(pvm_scale2);
initUserList(5);

function getButtonTeams() {
	
	//Use for fake data
	/*disableCreate(document.getElementById('createButton'), 60);
	let pvm_weights = createWeightObj();
	console.log(pvm_weights);
	let numTeams = document.getElementById("teamSizeSelect").value;
	let players = sendPlayerDataFake(getPlayerNames());
	console.log(players);
	let sortedPlayers = sortPlayers(players, pvm_weights);
	console.log(sortedPlayers);
	let teams = pickTeamsBucketSort(sortedPlayers, numTeams);
	createFinalTeamTable(teams);*/
	
	
	//Use for real Data
	disableCreate(document.getElementById('createButton'), 60);
	sendPlayerDataPromise(getPlayerNames()).then(value => {
		if (value.length > 0) {
			document.getElementById("infoPanel").innerHTML = "Players successfully loaded!";
			let pvm_weights = createWeightObj();
			let numTeams = document.getElementById("teamSizeSelect").value;
			let sortedPlayers = sortPlayers(value, pvm_weights);
			//console.log(sortedPlayers);
			let teams = pickTeamsBucketSort(sortedPlayers, numTeams);
			createFinalTeamTable(teams);
		}
		else {
			document.getElementById("infoPanel").innerHTML = "Process failed!";
		}
		
	}).catch(e => console.log(e));
	
}


