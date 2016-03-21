console.log("Hello");

function comp(a, b){
	if (a['arrivalTime'] > b['arrivalTime'])
		return true;
	else if (a['arrivalTime'] < b['arrivalTime'])
		return false;
	else
		return a['id'] - b['id'];
}

function restore(a, b){
	return a['id'] - b['id'];
}

function FIFO(data){ // First in first out
	x = 0;
	for(var i = 0; i < data.length; i++){
		x = Math.max(x,data[i].arrivalTime)
		obj = data[i].algos.FIFO;
		obj['startTime'] = x;
		x += data[i]['executeTime'];
		obj['TAT'] = x - data[i]['arrivalTime'];
		obj['WT'] = obj['TAT'] - data[i]['executeTime'];
		obj['RT'] = obj['startTime'] - data[i]['arrivalTime'];
	}
}

function SJN(data){ // Shortest job next
	n = data.length;
	x = 0;
	done = [];
	for(var i = 0; i < n; i++){
		done.push(false);
	}

	for(var k = 0; k < n; k++){
		earliest = n;
		shortest = n;
		for(var i = 0; i < n; i++) if (!done[i]){
			if (data[i].arrivalTime <= x && (shortest == n || data[i].executeTime < data[shortest].executeTime) )
				shortest = i;

			if (data[i].arrivalTime >= x && (earliest == n || data[i].arrivalTime < data[earliest].executeTime) )
				earliest = i;
		}	

		if (shortest != n)
			choosen = shortest;
		else
			choosen = earliest;

		done[choosen] = true;
		et = data[choosen].executeTime
		ar = data[choosen].arrivalTime
		startTime = Math.max(x, ar);
		TAT = startTime + et - ar;
		WT = TAT - et;
		RT = startTime - ar

		//console.log(x + " " + choosen + " " + 	Math.max(x, ar));
		data[choosen].algos.SJN = {
			startTime: startTime,
			TAT: TAT,
			WT: WT,
			RT: RT
		}

		x += et;
	}	
}

function SRTF(data){ // Shortest remaining time first
	n = data.length;
	x = data[0].arrivalTime;
	curr = 0;
	done = [];
	queue = [];
	for(var i = 0; i < n; i++){
		done.push(false);
		data[i].algos.SRTF.remainingTime = data[i].executeTime;
	}
	//console.log(JSON.stringify(data));
	while (true) {
		for(var i = 0; i < n; i++)
			if (!done[i] && data[i].arrivalTime <= x)
				queue.push(i);
		if (queue.length == 0)
			for(var i = 0; i < n; i++) if (!done[i]){
				queue.push(i);
				break;
			}
		for(var i = 0; i < queue.length; i++)
			if (done[queue[i]])
				 queue.splice(i, 1)
		/*console.log(queue);
		console.log(queue.length);
		console.log(done);
		console.log(x);*/
		if (queue.length == 0){
			for(var i = 0; i < n; i++)
				if (!done[i]){
					queue.push(i);
					break;
				}
			if (queue.length == 0)
				break;
		}
		leastRemaining = queue[0];
		for(var i = 1; i < queue.length; i++){
			if (!done[queue[i]] && 
				data[queue[i]].algos.SRTF.remainingTime < data[leastRemaining].algos.SRTF.remainingTime)
				leastRemaining = queue[i];
		}
		
		timeRun = data[leastRemaining].algos.SRTF.remainingTime;
	
		for(var i = 0; i < n; i++) 
			if (!done[i] && data[i].arrivalTime > x)
			timeRun = Math.min(timeRun, data[i].arrivalTime - x);
		if (data[leastRemaining].algos.SRTF.remainingTime == data[leastRemaining].executeTime){
			x = Math.max(x, data[leastRemaining].arrivalTime);
			data[leastRemaining].algos.SRTF.startTime = x; //console.log(leastRemaining);
		}
		data[leastRemaining].algos.SRTF.remainingTime -= timeRun;
		x += timeRun;
		
		if (data[leastRemaining].algos.SRTF.remainingTime == 0){
			done[leastRemaining] = true;
			et = data[leastRemaining].executeTime
			ar = data[leastRemaining].arrivalTime
			startTime = data[leastRemaining].algos.SRTF.startTime;
			//console.log(leastRemaining + " " + startTime);
			TAT = x - ar;
			WT = TAT - et;
			RT = startTime - ar

			//console.log(x + " " + leastRemaining + " " + 	Math.max(x, ar));
			data[leastRemaining].algos.SRTF = {
				remainingTime: 0,
				startTime: startTime,
				TAT: TAT,
				WT: WT,
				RT: RT
			}	
		}
	}

}

function RR(data, quantum){ // Round robin
	n = data.length;
	ct = n - 1;
	done = [];
	idx = 0;
	for(var i = 0; i < n; i++){
		done.push(false);
		data[i].algos.RR.remainingTime = data[i].executeTime;
		if (data[i].arrivalTime < data[idx].arrivalTime)
			idx = i;
	}
	x = data[idx].arrivalTime;
	curr = idx;
	ct = n;
	while (true) {
		x = Math.max(x, data[curr].arrivalTime);
		timeRun = Math.min(data[curr].algos.RR.remainingTime, quantum);
		if (data[curr].algos.RR.remainingTime == data[curr].executeTime){
			data[curr].algos.RR.startTime = x;
		}
		data[curr].algos.RR.remainingTime -= timeRun;
		x += timeRun;
		if (data[curr].algos.RR.remainingTime == 0){
			//console.log(curr);
			done[curr] = true;
			et = data[curr].executeTime
			ar = data[curr].arrivalTime
			startTime = data[curr].algos.RR.startTime;
			//console.log(leastRemaining + " " + startTime);
			TAT = x - ar;
			WT = TAT - et;
			RT = startTime - ar

			//console.log(x + " " + choosen + " " + 	Math.max(x, ar));
			data[curr].algos.RR = {
				startTime: startTime,
				TAT: TAT,
				WT: WT,
				RT: RT
			}	
		}

		for(var i = 0; i < n; i++) {
			curr = (curr + 1) % n;
			if (!done[curr] && data[curr].arrivalTime <= x)
				break;
		}
		//console.log(curr + " " + x);
		//console.log(done[0]);
		if (done[curr]){
			for(var i = 0; i < n; i++) {
				curr = (curr + 1) % n;
				if (!done[curr])
					break;
			}
			if (done[curr])
				break;
		}
	}
}

function calculateAvg(data){
	algos = ["FIFO","SJN","SRTF","RR"];
	n = data.length;
	avg = {n: n};
	for(var k = 0; k < algos.length; k++){
		sumTAT = 0;
		sumWT = 0;
		sumRT = 0;
		for(var i = 0; i < n; i++){
			sumTAT += data[i].algos[algos[k]].TAT;
			sumWT += data[i].algos[algos[k]].WT;
			sumRT += data[i].algos[algos[k]].RT;
		}
		avg[algos[k]] = {
			sumTAT: sumTAT,
			sumWT: sumWT,
			sumRT: sumRT
		};
	}
	console.log(avg);
	return avg;
}

function calculate($scope){
	//console.log($scope);
	string = document.getElementById("textarea").value;
	quantum = document.getElementById("quantum").value || '20';
	quantum = parseFloat(quantum);
	
	stringArr = string.split("\n");
	

	data = [];
	for(var i = 0; i < stringArr.length; i++) if (stringArr[i] != ''){
		data.push({
			'id': i,
			'arrivalTime': parseFloat(stringArr[i].split(" ")[1] || '0'),
			'executeTime': parseFloat(stringArr[i].split(" ")[0]),
			'algos': {'FIFO': {}, 'SJN': {}, 'SRTF': {}, 'RR': {}}
		})
	}

	data = data.sort(comp);
	FIFO(data);
	SRTF(data);
	data = data.sort(restore);

	SJN(data);
	RR(data, quantum);

	$scope.avg = calculateAvg(data);
	$scope.data = data;
	//logs
	//console.log(string);	
	//console.log(stringArr);
	console.log(data);
}

var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
    $scope.calculate = function(){
    	calculate($scope);
    };
});

