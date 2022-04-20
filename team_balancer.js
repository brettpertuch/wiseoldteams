var url = "https://api.wiseoldman.net/players/track";

//console.log(pvm_scale);

let numUsers = 0;

//let players = [];

/*function sendPlayerData(playerList, players) {
	if (players === undefined)
		players = [];
	for (var player in playerList) {
		if (!findPlayerinList(playerList[player].toLowerCase(), players)) {
			var data = "{\"username\":" + "\"" +  playerList[player] + "\"" + "}";
			let xhr = new XMLHttpRequest();
			xhr.open("POST", url, false);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				console.log(xhr.status);
				if ([200, 201].includes(xhr.status)) {
					//console.log(xhr.responseText);
					let username = JSON.parse(xhr.responseText).displayName;
					let res = JSON.parse(xhr.responseText);
					players.push(createPlayerObj(username, res));
				}
			}};
			xhr.send(data);
		}
	}
	return players;
}*/

async function sendPlayerDataPromise(playerList) {
	let promises = [];
	for (player in playerList) {
		var data = "{\"username\":" + "\"" +  playerList[player] + "\"" + "}";
		let xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		//xhr.setRequestHeader("Origin", "https://api.wiseoldman.net");
		xhr.setRequestHeader("Content-Type", "application/json");
		const promise = new Promise((resolve, reject) => {
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					console.log(xhr.status);
					//console.log(xhr.responseText);
					if ([200, 201].includes(xhr.status)) {
						//console.log(xhr.responseText);
						let username = JSON.parse(xhr.responseText).displayName;
						let res = JSON.parse(xhr.responseText);
						//players.push(createPlayerObj(username, res));
						//return res;
						return resolve(xhr.responseTex);
						//return resolve(createPlayerObj(username, res));
					}
					else {
						console.log(xhr.responseText);
						return resolve(undefined);
					}
				}
			}
		});
		xhr.send(data);
		promises.push(promise);
	}
	
	return await Promise.all(promises).then(r => r).catch(error => {console.log(error)});
	//console.log(result);
	//return result;

}

function sendSinglePlayerData(player) {
	
}

function sendPlayerData(playerList) {
	let players = [];
	for (var player in playerList) {
		//if (!findPlayerinList(playerList[player].toLowerCase(), players)) {
			var data = "{\"username\":" + "\"" +  playerList[player] + "\"" + "}";
			let xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				//console.log(xhr.status);
				if ([200, 201].includes(xhr.status)) {
					//console.log(xhr.responseText);
					let username = JSON.parse(xhr.responseText).displayName;
					let res = JSON.parse(xhr.responseText);
					players.push(createPlayerObj(username, res));
				}
			}};
			xhr.send(data);
		//}
	}
	return players;
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
			if (pvm_scale2[key2].includes(key))
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


/*function sendPlayerDataFake(playerList, players) {
	if (players === undefined)
		players = [];
	for (var player in playerList) {
		if (!findPlayerinList(playerList[player].toLowerCase(), players)) {
			const player_obj = {
				name: playerList[player]
			};
			for (const key in pvm_scale2) {
				player_obj[key] = Math.random() * 1000;
			}
			players.push(player_obj);
		}
		else
			console.log("player already in list!");
	}
	return players;
}*/

function sendPlayerDataFake(playerList) {
	let players = [];
	for (var player in playerList) {
		//if (!findPlayerinList(playerList[player].toLowerCase(), players)) {
			const player_obj = {
				name: playerList[player]
			};
			for (const key in pvm_scale2) {
				player_obj[key] = Math.random() * 1000;
			}
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
		thisHeader.innerHTML = "Team " + (i + 1);
		headerRow.appendChild(thisHeader);
	}
	table.appendChild(headerRow);
	for (let i = 0; i < getLongestTeam(teams); i++) {
		let newRow = document.createElement("tr");
		for (let j = 0; j < teams.length; j++) {
			let newCol = document.createElement("td");
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

function createTeamDropdown() {
	let numUsers = document.getElementById("playerContainer").childElementCount;
	console.log(numUsers);
	let dropdown = document.getElementById("teamSizeSelect");
	removeAllChildNodes(dropdown);
	for (let i = 1; i <= numUsers; i++) {
		const option = document.createElement("option");
		option.setAttribute("value", i);
		option.innerHTML = i;
		dropdown.appendChild(option);
	}
}

function createUserInput() {
	const playerDiv = document.createElement("div");
	const removeButton = document.createElement("input");
	removeButton.setAttribute("type", "button");
	removeButton.setAttribute("value", "x");
	const input = document.createElement("input");
	input.setAttribute("type", "text");
	numUsers++;
	playerDiv.setAttribute("id", "playerDiv" + numUsers);
	removeButton.onclick = function() { removeUserInput(playerDiv.id); };
	input.setAttribute("name", "usernameInput");
	input.setAttribute("id", "usernameInput" + numUsers);
	input.className = "playerNameBox";
	playerDiv.appendChild(removeButton);
	playerDiv.appendChild(input);
	document.getElementById("playerContainer").appendChild(playerDiv);
	createTeamDropdown();
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
	console.log(names);
	return names;
}




/* arr[]  ---> Input Array
data[] ---> Temporary array to store current combination
start & end ---> Starting and Ending indexes in arr[]
index  ---> Current index in data[]
r ---> Size of a combination to be printed */
let teamList = [];
function combinationUtil(arr,data,start,end,index,r)
{
	// Current combination is ready to be printed, print it
	if (index == r)
	{
		let out_arr = [];
		let tot_score = 0;
		for (let j=0; j<r; j++)
		{
			out_arr.push(data[j].name);
			tot_score += data[j].raids;
		}
		let team = [out_arr, Math.abs((tot_score / out_arr.length) - player_avg)];
		//teamList.push(team);
		//console.log(team);
	}
	 
	// replace index with all possible elements. The condition
	// "end-i+1 >= r-index" makes sure that including one element
	// at index will make a combination with remaining elements
	// at remaining positions
	for (let i=start; i<=end && end-i+1 >= r-index; i++)
	{
		data[index] = arr[i];
		combinationUtil(arr, data, i+1, end, index+1, r);
	}
}
 
// The main function that prints all combinations of size r
// in arr[] of size n. This function mainly uses combinationUtil()
function printCombination(arr,n,r)
{
	// A temporary array to store all combination one by one
	let data = new Array(r);
	 
	// Print all combination using temporary array 'data[]'
	combinationUtil(arr, data, 0, n-1, 0, r);
}



function sortPlayers(players) {
	
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
	
	console.log(score_obj);
	
	for (let i = 0; i < players.length; i++)
		players[i].tot_score = 0;
	for (let i = 0; i < players.length; i++) {
		let tot = 0;
		for (const key in score_obj) {
			//console.log(players[i][key]);
			//console.log(score_obj[key]);
			//console.log(key + " -> " + players[i][key]);
			//console.log(key + " -> " + score_obj[key]);
			if (score_obj[key] != 0)
				tot += players[i][key] / score_obj[key];
			else
				tot += 0;
		}
			//tot += (players[i][key] - score_obj[key]) * (1/Object.keys(score_obj).length);
		players[i].tot_score = tot;
		//players[i].tot_score = 1000;
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

function pickTeams(sortedTeams, playerList) {
	let used = [];
	let final_teams = [];
	for (team in sortedTeams) {
		let temp_team = sortedTeams[team][0];
		//console.log("checking team " + temp_team);
		let found_player_in_team = false;
		for (let i = 0; i < temp_team.length; i++) {
			//console.log("checking player: " + temp_team[i]);
			if (used.includes(temp_team[i])) {
				//console.log(temp_team[i] + " is already in another team");
				found_player_in_team = true;
			}
		}
		if (!found_player_in_team) {
			final_teams.push(temp_team);
			for (let i = 0; i < temp_team.length; i++)
				used.push(temp_team[i]);
		}
	}
	console.log(final_teams);
}

function pickTeamsRR(sortedPlayers, teamSize) {
	let c = 0;
	let final_teams = [];
	for (let i = 0; i < teamSize; i++)
		final_teams[i] = {players:[], score:0};
	for (i = 0; i < sortedPlayers.length; i++) {
		final_teams[c].players.push(sortedPlayers[i].name);
		final_teams[c].score += sortedPlayers[i].raids;
		if (c < teamSize - 1)
			c++;
		else
			c = 0;
	}
	console.log(final_teams);
}

function pickTeamsRRPlus(sortedPlayers, teamSize) {
	let final_teams = [];
	let topptr = 0;
	let bottomptr = sortedPlayers.length - 1;
	let dist = 1000;
	let c = 0;
	for (let i = 0; i < teamSize; i++)
		final_teams[i] = {players:[], score:0};
	while (dist > 1) {
		dist = Math.abs(topptr - bottomptr);
		final_teams[c].players.push(sortedPlayers[topptr].name);
		final_teams[c].score += sortedPlayers[topptr].raids;
		final_teams[c].players.push(sortedPlayers[bottomptr].name);
		final_teams[c].score += sortedPlayers[bottomptr].raids;
		topptr++;
		bottomptr--;
		if (c < teamSize - 1)
			c++;
		else
			c = 0;
	}
	console.log(final_teams);
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


//let in_arr = ['dw guns', 'denglish', 'dr moko', 'brett p', 'bape szn', 'neverseas', 'dw cube', 'fishnet butt', 'newmark0g', 'beerrcules', 'dw mckean', 'dw cargo', 'joe exoti c', 'dw dougdabs', 'drynx', 'itskatiee', 'ythaar', 'brianisme', 'woodzer', 'vyck', 'mini soda', 'fun to kill', 'hello canada', 'keydiss', 'wana corp', 'freebird482', 'dw vurkzi', 'vyrusplays', 'lokeygarbage', 'custom', 'bokenboat', 'office hours'];
let in_arr = ['Brett P'];

//let arr=sendPlayerData(in_arr);
let arr = sendPlayerDataFake(in_arr);
let r = 2;
let n = arr.length;

//let player_avg = getPlayerAvg(arr);
//console.log(player_avg);

function getButtonTeams() {
	disableCreate(document.getElementById('createButton'), 10);
	let numTeams = document.getElementById("teamSizeSelect").value;
	//let players = sendPlayerDataFake(getPlayerNames());
	//let players = sendPlayerData(getPlayerNames());
	//let players = sendPlayerDataPromise(getPlayerNames());
	//console.log(players);
	
	sendPlayerDataPromise(getPlayerNames()).then(value => {
		//let players = value;
		console.log(value);
		//let sortedPlayers = sortPlayers(value);
		//console.log(sortedPlayers);
		//let teams = pickTeamsBucketSort(sortedPlayers, numTeams);
		//createFinalTeamTable(teams);
		
	}).catch(e => console.log(e));
	//console.log(players);
	
	//
	//console.log(sortedPlayers);
	//let teams = pickTeamsBucketSort(sortedPlayers, numTeams);
	//console.log(teams);
	//createFinalTeamTable(teams);
	
	
	
}

//printCombination(arr, n, r);
//console.log(sortPlayers(arr));
//console.log(sortTeams(teamList));
//pickTeamsRR(sortPlayers(arr), 10);
//let sortedPlayers = sortPlayers(arr);
//console.log(sortedPlayers);
//pickTeamsBucketSort(sortedPlayers, 4);
//pickTeamsRRPlus(sortedPlayers, 10);

//pickTeams(sortTeams(teamList), ['dw guns', 'denglish', 'dr moko', 'brett p', 'bape szn', 'neverseas', 'dw cube', 'fishnet butt', 'newmark0g', 'beerrcules', 'dw mckean', 'dw cargo', 'joe exoti c', 'dw dougdabs', 'drynx', 'itskatiee', 'ythaar', 'brianisme', 'woodzer', 'vyck', 'mini soda', 'fun to kill', 'hello canada', 'keydiss', 'wana corp', 'freebird482', 'dw vurkzi', 'vyrusplays', 'lokeygarbage', 'custom']);



