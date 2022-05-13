var api_url = "https://api.wiseoldman.net/players/track";
let numUsers = 0;

function playerInPlayers(player, players) {
	for (index in players) {
		if (players[index].name.toLowerCase() == player.toLowerCase())
			return index;
	}
	return -1;
}

/*async function sendPlayerDataPromise(playerList, players) {
	var promises = [];
	for (player in playerList) {
		//console.log(playerList[player]);
		let foundPlayerIndex = playerInPlayers(playerList[player], players);
		//console.log(foundPlayerIndex);
		if (foundPlayerIndex == -1) {
			//console.log("player not found");
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
							return resolve(createPlayerObj(username, res));
						}
						else {
							//console.log(playerList[player]);
							return reject("Error: " + JSON.parse(xhr.responseText).message + playerList[player]);
						}
					}
				}
			});
			
			xhr.send(data);
			promises.push(promise);
		}
		else {
			//console.log("player was found");
			const promise = new Promise((resolve, reject) => {
				resolve(players[foundPlayerIndex]);
			});
			promises.push(promise);
		}
	}
	return await Promise.all(promises).then(r => r).catch(error => {return {"code":-1, "msg":error}});
}*/

async function sendPlayerDataPromise(playerList, players) {
	var promises = [];
	document.getElementById("infoPanel").innerHTML = "Loading Players...";
	for (player in playerList) {
		//console.log(playerList[player]);
		let foundPlayerIndex = playerInPlayers(playerList[player], players);
		//console.log(foundPlayerIndex);
		if (foundPlayerIndex == -1) {
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
							return resolve({"code":1, "obj":createPlayerObj(username, res)});
						}
						else {
							//console.log(playerList[player]);
							//return reject("Error: " + JSON.parse(xhr.responseText).message + playerList[player]);
							return resolve({"code":-1, "err":JSON.parse(xhr.responseText)});
						}
					}
				}
			});
			
			xhr.send(data);
			promises.push(promise);
		}
		else {
			//console.log("player was found");
			const promise = new Promise((resolve, reject) => {
				resolve(players[foundPlayerIndex]);
			});
			promises.push(promise);
		}
	}
	return await Promise.all(promises).then(r => r);
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
				if (playerList[player] == 'brett p')
					player_obj[key] = Math.random() * 1000 + 6000;
				else
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

function shuffle(arr) {
	let currentIndex = arr.length,  randomIndex;
	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
	}
	return arr;
}

function createFinalTeamTable(teams, showScores) {
	let copied_teams = JSON.parse(JSON.stringify(teams));
	if (!showScores) {
		for (team in copied_teams) {
			//copied_teams[team].players = shuffle(copied_teams[team].players);
			copied_teams[team].players = copied_teams[team].players.sort(function (a, b) {return a[0].toLowerCase().localeCompare(b[0].toLowerCase());});
		}
	}
	let table = document.getElementById("finalTeamTable");
	removeAllChildNodes(table);
	let headerRow = document.createElement("tr");
	let subHeaderRow = document.createElement("tr");
	for (let i = 0; i < copied_teams.length; i++) {
		let thisHeader = document.createElement("th");
		thisHeader.className = "teamTableCell";
		thisHeader.innerHTML = "Team " + (i + 1);
		if (showScores)
			thisHeader.setAttribute("colspan", "2");
		headerRow.appendChild(thisHeader);
		let subHeaderCol1 = document.createElement("th");
		subHeaderCol1.innerHTML = "Name";
		subHeaderRow.appendChild(subHeaderCol1);
		let subHeaderCol2 = document.createElement("th");
		subHeaderCol2.innerHTML = "Pts.";
		subHeaderRow.appendChild(subHeaderCol2);
	}
	table.appendChild(headerRow);
	if (showScores)
		table.appendChild(subHeaderRow);
	for (let i = 0; i < getLongestTeam(copied_teams); i++) {
		let newRow = document.createElement("tr");
		for (let j = 0; j < copied_teams.length; j++) {
			let newCol = document.createElement("td");
			newCol.className = "teamTableCell";
			let newCol2 = document.createElement("td");
			newCol2.className = "teamTableCell";
			if (copied_teams[j].players[i] != undefined) {
				if (showScores) {
					newCol.innerHTML = copied_teams[j].players[i][0];
					newCol2.innerHTML = copied_teams[j].players[i][1].toFixed(2);
				}
				else
					newCol.innerHTML = copied_teams[j].players[i][0];
			}
			else {
				newCol.innerHTML = "";
				newCol2.innerHTML = "";
			}
			newRow.appendChild(newCol);
			if (showScores)
				newRow.appendChild(newCol2);
		}
		table.appendChild(newRow);
	}
	if (showScores) {
		let newRow = document.createElement("tr");
		for (let j = 0; j < copied_teams.length; j++) {
			let newCol = document.createElement("td");
			let newCol2 = document.createElement("td");
			newCol.innerHTML = "";
			newCol2.innerHTML = copied_teams[j].score.toFixed(2);
			newRow.appendChild(newCol);
			newRow.appendChild(newCol2);
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
	let pvm_keys = Object.keys(pvm_obj);
	let labels = [["ehp","Efficient Hours Played (Skilling)"]];
	for (key in pvm_keys) {
		labels.push([pvm_keys[key], pvm_obj[pvm_keys[key]].label]);
	}
	labels.sort(function(a, b) {
		if (a[1] > b[1])
			return 1;
		else if (a[1] < b[1])
			return -1;
		else
			return 0;
	});
	//console.log(labels);
	for (index in labels) {
		//console.log( Object.keys(pvm_obj).sort());
		let row = document.createElement("tr");
		let cell = document.createElement("td");
		let slider = document.createElement("input");
		slider.setAttribute("id", labels[index][0] + "-slider");
		slider.setAttribute("name", "pvmSlider");
		slider.setAttribute("type", "range");
		slider.setAttribute("min", "0");
		slider.setAttribute("max", "100");
		slider.setAttribute("value", "100");
		slider.className = "weightSlider";
		slider.addEventListener("input", function() {
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
		label.innerHTML = "&ensp;" + labels[index][1];
		cell.appendChild(slider);
		cell.appendChild(valLabel);
		cell.appendChild(label);
		row.appendChild(cell);
		container.appendChild(row);
	}
	let height = container.offsetHeight;
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
		weightObj[vals[i].id.split("-")[0]] = parseFloat(vals[i].value);
	}
	return weightObj;
}

function createTeamDropdown() {
	let numUsers = document.getElementById("playerContainer").childElementCount;
	let dropdown = document.getElementById("teamSizeSelect");
	let prevVal = dropdown.value;
	removeAllChildNodes(dropdown);
	for (let i = 1; i <= numUsers; i++) {
		const option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = i;
		dropdown.appendChild(option);
	}
	dropdown.value = prevVal;
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

function getSelectedInputType() {
	let radios = document.getElementsByName("playerInputType");
	for (let i = 0; i < radios.length; i++) {
		if (radios[i].checked)
			return radios[i].value;
	}
	return radios[0].value;
}

function showActiveInputType(input) {
	let container = document.getElementById("playerContainer");
	let container2 = document.getElementById("playerContainer2");
	if (input == 1) {
		container.style.display = "block";
		container2.style.display = "none";
	}
	else {
		container.style.display = "none";
		container2.style.display = "block";
	}
}

function handleInputType() {
	showActiveInputType(getSelectedInputType());
}

let radios = document.getElementsByName("playerInputType");
for (let i = 0; i < radios.length; i++) {
	radios[i].addEventListener("input", function() {
		handleInputType();
	});
}

/*document.getElementById("playerTextInput").addEventListener("input", function() {
	getTextInputData();
});*/

function getTextInputData() {
	let text = document.getElementById("playerTextInput").value;
	let names = text.split("\n")
	let final_names = [];
	for (name in names) {
		if (names[name] != "" && !final_names.includes(names[name].trim().toLowerCase()))
			final_names.push(names[name].trim());
		
	}
	//console.log(text.split("\n"));
	//console.log(final_names);
	return final_names;
	
}

function importFromText() {
	let names = getTextInputData();
	let current_names = getPlayerNames()[0];
	let new_arr = current_names.concat(names);
	new_arr = [...new Set([...current_names, ...names])]
	let elements = document.getElementsByName("usernameInput");
	if (names.length > 0) {
		for (let i = 0; i < new_arr.length; i++) {
			if (elements.length - 1 < i) {
				createUserInput();
				elements = document.getElementsByName("usernameInput");
			}
			elements[i].value = new_arr[i];
		}
		document.getElementById("playerTextInput").value = "";
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
	input.setAttribute("spellcheck", "false");
	input.className = "playerTextBox";
	let scy_label = document.createElement("label");
	let scy_img = document.createElement("img");
	scy_img.src = "scy_sprite.gif";
	let scy_check = document.createElement("input");
	scy_check.setAttribute("type", "checkbox");
	scy_check.setAttribute("name", "scy_check");
	scy_label.appendChild(scy_img);
	scy_label.appendChild(scy_check);
	let tbow_label = document.createElement("label");
	let tbow_img = document.createElement("img");
	tbow_img.src = "tbow_sprite.gif"
	let tbow_check = document.createElement("input");
	tbow_check.setAttribute("type", "checkbox");
	tbow_check.setAttribute("name", "tbow_check");
	tbow_label.appendChild(tbow_img);
	tbow_label.appendChild(tbow_check);
	playerDiv.appendChild(removeButton);
	playerDiv.appendChild(input);
	playerDiv.appendChild(scy_label);
	playerDiv.appendChild(tbow_label);
	document.getElementById("playerContainer").appendChild(playerDiv);
	createTeamDropdown();
	let scrollElement = document.getElementById("playerContainer");
	scrollElement.scrollTop = scrollElement.scrollHeight;
}

function initUserList(amt) {
	for (let i = 0; i < amt; i++)
		createUserInput();
}


function toggleScore(teams) {
	let val = document.getElementById("showScoreCheck").checked;
	if (teams.length > 0) {
		createFinalTeamTable(teams, val);
	}
}


function removeUserInput(id) {
	document.getElementById(id).remove();
	createTeamDropdown();
}

function getPlayerNames() {
	let elements = document.getElementsByName("usernameInput");
	let scy_checks = document.getElementsByName("scy_check");
	let tbow_checks = document.getElementsByName("tbow_check");
	names = [];
	bonuses = [];
	for (i = 0; i < elements.length; i++) {
		if (elements[i].value != "" && !names.includes(elements[i].value.trim().toLowerCase())) {
			let bonus_obj = {"has_scy":false, "has_tbow":false};
			if (scy_checks[i].checked)
				bonus_obj.has_scy = true;
			if (tbow_checks[i].checked)
				bonus_obj.has_tbow = true;
			bonuses.push(bonus_obj);
			names.push(elements[i].value.trim().toLowerCase());
		}
	}
	//console.log(names);
	return [names, bonuses];
}


function sortPlayers(players, weightObj, bonuses) {
	
	//Using Avg
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
	
	
	/*
	//Using Median
	let score_obj = {};
	for (const key in players[0])
		if (key != 'name')
			score_obj[key] = [];
	
	for (let i = 0; i < players.length; i++) {
		for (const key in players[i]) {
			if (key != 'name')
				score_obj[key].push(players[i][key]);
		}
	}
	for (const key in score_obj) {
		console.log(score_obj[key].sort());
		score_obj[key] = score_obj[key].sort(function(a, b) { return a - b;})[Math.floor(score_obj[key].length / 2)];
		console.log(score_obj[key]);
	}
	*/
	
	for (let i = 0; i < players.length; i++) {
		players[i].tot_score = 0;
		if (bonuses.length > 0) {
			players[i].has_scy = bonuses[i].has_scy;
			players[i].has_tbow = bonuses[i].has_tbow;
		}
		else {
			players[i].has_scy = false;
			players[i].has_tbow = false;
		}
	}
	
	for (let i = 0; i < players.length; i++) {
		let tot = 0;
		for (const key in score_obj) {
			if (score_obj[key] != 0) {
				if (key in weightObj) {
					let scy_bonus = 0;
					let tbow_bonus = 0;
					if (key in pvm_scale2) {
						if (players[i].has_scy)
							scy_bonus = pvm_scale2[key].scy_bonus;
						if (players[i].has_tbow)
							tbow_bonus = pvm_scale2[key].tbow_bonus;
					}
					let basePts = (players[i][key] / score_obj[key]);
					tot += (basePts + (basePts * scy_bonus) + (basePts * tbow_bonus)) * weightObj[key];
				}
				else {
					let scy_bonus = 0;
					let tbow_bonus = 0;
					if (key in pvm_scale2) {
						if (players[i].has_scy)
							scy_bonus = pvm_scale2[key].scy_bonus;
						if (players[i].has_tbow)
							tbow_bonus = pvm_scale2[key].tbow_bonus;
					}
					let basePts = (players[i][key] / score_obj[key]);
					tot += (basePts + (basePts * scy_bonus) + (basePts * tbow_bonus));
				}
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
	let copyBuckets = JSON.parse(JSON.stringify(buckets));
	let newBuckets = [];
	let smallestIndex = 0;
	let smallestCount = 0;
	let smallestAmt = Number.MAX_SAFE_INTEGER;
	for (let i = 0; i < buckets.length; i++) {
		if (buckets[i].players.length < smallestAmt) {
			smallestAmt = buckets[i].players.length;
		}
	}
	for (let i = 0; i < buckets.length; i++) {
		if (buckets[i].players.length <= smallestAmt) {
			newBuckets.push([copyBuckets[i], i]);
		}
	}
	
	return newBuckets;
}

function getLowestBucket(buckets) {
	let lowestIndex = 0;
	let lowestAmt = Number.MAX_SAFE_INTEGER;
	if (buckets.length > 0) {
		if (!Array.isArray(buckets[0])) {
			for (let i = 0; i < buckets.length; i++) {
				if (buckets[i].score < lowestAmt) {
					lowestAmt = buckets[i].score;
					lowestIndex = i;
				}
			}
			return lowestIndex;
		}
		else {
			for (let i = 0; i < buckets.length; i++) {
				if (buckets[i][0].score < lowestAmt) {
					lowestAmt = buckets[i][0].score;
					lowestIndex = buckets[i][1];
				}
			}
			return lowestIndex;
		}
	}
	else
		return 0;
}

function getLargestBucketVariance(buckets) {
	let largestVariance = 0;
	let largestVarianceIndex = 0;
	for (let i = 0; i < buckets.length; i++) {
		tot = 0;
		for (let j = 0; j < buckets[i].players.length; j++) {
			tot += Math.pow(buckets[i].players[j][1] - (buckets[i].score / buckets[i].players[j].length), 2)
		}
		variance = tot / buckets[i].players.length;
		//console.log("variance for team " + (i + 1) + " is " + variance);
		if (variance > largestVariance) {
			largestVariance = variance;
			largestVarianceIndex = i;
		}
	}
	return largestVarianceIndex;
}


//Will return true if any difference exceeds the threshold
function exceedsThreshold(values, threshold) {
	for (let i = 0; i < values.length - 1; i++) {
		for (let j = i + 1; j < values.length; j++) {
			//console.log(values[i] + " - " + values[j]);
			if (Math.abs(values[i] - values[j]) > threshold)
				return true;
		}
	}
	return false;
}

function addToAllButHighest(values, valToAdd, highestIndex) {
	let newVals = [];
	for (val in values) {
		if (val != highestIndex)
			newVals.push(values[val].players.length + valToAdd);
		else
			newVals.push(values[val].players.length);
	}
	return newVals;
}

function getLowestTestBucket(testBuckets) {
	let lowestVal = Number.MAX_SAFE_INTEGER;
	let lowestIndex = 0;
	for (let i = 0; i < testBuckets.length; i++) {
		if (testBuckets[i] < lowestVal) {
			lowestVal = testBuckets[i];
			lowestIndex = i;
		}
	}
	return lowestIndex;
}


function getNextBucket(buckets, teamSize, usedCount, numPlayers) {
	let playersRemaining = numPlayers - usedCount;
	let lowestSize = Number.MAX_SAFE_INTEGER;
	let lowestSizeIndex = 0;
	let highestSize = 0;
	let highestSizeIndex = 0;
	let lowestPPT = 0;
	let lowestPPTIndex = 0;
	for (let i = 0; i < buckets.length; i++) {
		let dist = buckets[i].players.length - teamSize;
		let bucketSize = buckets[i].players.length;
		let pointsPerPlayer = buckets[i].score / buckets[i].players.length;
		let pointsPerTeam = buckets[i].score;
		if (pointsPerTeam < lowestPPT) {
			lowestPPT = pointsPerTeam;
			lowestPPTIndex = i;
		}
		if (bucketSize > highestSize) {
			highestSize = bucketSize;
			highestSizeIndex = i;
		}
		if (bucketSize < lowestSize) {
			lowestSize = bucketSize;
			lowestSizeIndex = i;
		}
	}
	let maxDist = highestSize - lowestSize;
	let allButHighestPlayers = usedCount - maxDist;
	
	let testTeams = Math.floor(playersRemaining / (buckets.length));
	let singleton = (playersRemaining % (buckets.length - 1));
	//console.log("test teams is " + testTeams);
	//console.log("singleton is " + singleton);
	//console.log("players remaining is " + playersRemaining);
	let testBuckets = addToAllButHighest(buckets, testTeams, highestSizeIndex);
	//testBuckets[lowestSizeIndex] += singleton;
	//console.log(testBuckets);
	//console.log(JSON.parse(JSON.stringify(buckets)));
	//console.log("highest size is " + highestSize);
	//console.log("team size is " + teamSize);
	let addPlayerToLowest = !exceedsThreshold(testBuckets, 0) || highestSize < teamSize - 1;
	//console.log(addPlayerToLowest);
	
	/*if (addPlayerToLowest) {
		let smallestBucket = getSmallestBucket(buckets, teamSize);
		let smallestBucketIndex = smallestBucket[0];
		let smallestBucketCount = smallestBucket[1];
		if (smallestBucketCount <= 1) {
			console.log("adding player to team w/ least players");
			return smallestBucketIndex;
		}
	}
	else {
		console.log("adding player to team w/ least points");
		return getLowestBucket(buckets);
	}*/
	if (!addPlayerToLowest) {
		return getLowestBucket(getSmallestBucket(buckets));
	}
	else
		return getLowestBucket(buckets);
}



function pickTeamsBucketSort(sortedPlayers, num_teams) {
	let final_teams = [];
	let teamSize = Math.floor(sortedPlayers.length / num_teams);
	for (let i = 0; i < num_teams; i++)
		final_teams[i] = {players:[], score:0};
	for (let i = 0; i < sortedPlayers.length; i++) {
		//console.log(i);
		//console.log(final_teams);
		if (i < num_teams) {
			//console.log(sortedPlayers[i].name);
			final_teams[i].players.push([sortedPlayers[i].name, sortedPlayers[i].tot_score]);
			final_teams[i].score += sortedPlayers[i].tot_score;
			//console.log("Adding " + sortedPlayers[i].name + " to team " + (i + 1));
		}
		else {
			let nextIndex = getNextBucket(final_teams, teamSize, i, sortedPlayers.length);
			//console.log(teamSize);
			final_teams[nextIndex].players.push([sortedPlayers[i].name, sortedPlayers[i].tot_score]);
			final_teams[nextIndex].score += sortedPlayers[i].tot_score;
			//console.log("Adding " + sortedPlayers[i].name + " to team " + (nextIndex + 1));
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

function createErrorTable(errors, target) {
	for (let i = 0; i < errors.length; i++) {
		target.innerHTML += '<p>' + errors[i].message + '</p>';
	}
}


showActiveInputType(getSelectedInputType());
createPVMSliders(pvm_scale2);
initUserList(10);

var players = [];
var teams = [];
document.getElementById("showScoreCheck").addEventListener("input", function() {
	toggleScore(teams);
});

function getButtonTeams() {
	
	//Use for fake/test data
	/*let playerNames = [];
	let bonuses = [];
	if (getSelectedInputType() == 1) {
		let playerData = getPlayerNames();
		playerNames = playerData[0];
		bonuses = playerData[1];
	}
	else
		playerNames = getTextInputData();
	//disableCreate(document.getElementById('createButton'), 60);
	let pvm_weights = createWeightObj();
	console.log(pvm_weights);
	let numTeams = document.getElementById("teamSizeSelect").value;
	let scoresToggled = document.getElementById("showScoreCheck").checked;
	let players = sendPlayerDataFake(playerNames);
	console.log(players);
	let sortedPlayers = sortPlayers(players, pvm_weights, bonuses);
	console.log(sortedPlayers);
	let teams = pickTeamsBucketSort(sortedPlayers, numTeams);
	createFinalTeamTable(teams, scoresToggled);*/
	
	
	//Use for real Data
	/*let playerNames = [];
	let bonuses = [];
	if (getSelectedInputType() == 1) {
		let playerData = getPlayerNames();
		playerNames = playerData[0];
		bonuses = playerData[1];
	}
	else
		playerNames = getTextInputData();
	sendPlayerDataPromise(playerNames, players).then(value => {
		//console.log(value);
		disableCreate(document.getElementById('createButton'), 45);
		let pvm_weights = createWeightObj();
		let numTeams = document.getElementById("teamSizeSelect").value;
		let scoresToggled = document.getElementById("showScoreCheck").checked;
		if (Array.isArray(value)) {
			document.getElementById("infoPanel").innerHTML = "Players successfully loaded!";
			players = value;
			let sortedPlayers = sortPlayers(players, pvm_weights, bonuses);
			teams = pickTeamsBucketSort(sortedPlayers, numTeams);
			createFinalTeamTable(teams, scoresToggled);
		}
		else {
			document.getElementById("infoPanel").innerHTML = value.msg;
		}
	}).catch(e => {
	console.log(e);
	document.getElementById("infoPanel").innerHTML = "Error: Something bad happened. Please check the console.";
	});*/
	
	//Use for real Data
	let playerNames = [];
	let bonuses = [];
	if (getSelectedInputType() == 1) {
		let playerData = getPlayerNames();
		playerNames = playerData[0];
		bonuses = playerData[1];
	}
	else
		playerNames = getTextInputData();
	sendPlayerDataPromise(playerNames, players).then(value => {
		document.getElementById("infoPanel").innerHTML = "Done loading.";
		//console.log(value);
		disableCreate(document.getElementById('createButton'), 45);
		let pvm_weights = createWeightObj();
		let numTeams = document.getElementById("teamSizeSelect").value;
		let scoresToggled = document.getElementById("showScoreCheck").checked;
		
		let final_errors = [];
		let final_players = [];
		for (let i = 0; i < value.length; i++) {
			if (value[i].code == 1)
				final_players.push(value[i].obj);
			else
				final_errors.push(value[i].err);
		}
		
		let sortedPlayers = sortPlayers(final_players, pvm_weights, bonuses);
		teams = pickTeamsBucketSort(sortedPlayers, numTeams);
		createFinalTeamTable(teams, scoresToggled);
		for (let i = 0; i < final_errors.length; i++)
			console.log(final_errors[i]);
		createErrorTable(final_errors, document.getElementById("infoPanel"));
		
		
	}).catch(e => {
		console.log(e);
		document.getElementById("infoPanel").innerHTML = "Error: Something bad happened. Please check the console.";
	});
	
}


