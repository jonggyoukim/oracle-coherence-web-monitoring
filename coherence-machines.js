function Machines() {
	var jmx = new Jolokia(jurl);
	var machineMap = new Map();
	var nodeNames = jmx.search("Coherence:type=Node,*");
	for (var i = 0; i < nodeNames.length; i++) {
		var Id = jmx.getAttribute(nodeNames[i], "Id");
		var UnicastAddress = jmx.getAttribute(nodeNames[i], "UnicastAddress");
		var machine = machineMap.get(UnicastAddress);
		if (machine == null) {
			machine = {
				UnicastAddress : UnicastAddress,
				CoreCount : 1,
				LoadAverage : 0,
				SystemCpuLoad : 0,
				TotalPhysicalMemory : 0,
				FreePhysicalMemory : 0,
				PercentageFreeMemory : 0,
				AvailableProcessors : 0,
				OSName : '',
				NodeId : Id
			};
			machineMap.put(UnicastAddress, machine);
		} else {
			machine.UnicastAddress = UnicastAddress,
			machine.CoreCount = machine.CoreCount + 1
		}
	}
	var totalCoreCount = 0;
	var keys = machineMap.keys();
	for (var i = 0; i < keys.length; i++) {
		var machine = machineMap.get(keys[i]);
		var nodeNames = jmx.search("Coherence:type=Platform,Domain=java.lang,subType=OperatingSystem,nodeId=" + machine.NodeId);
		var nodeName = nodeNames[0];
		machine.LoadAverage = jmx.getAttribute(nodeName, "SystemLoadAverage");
		machine.SystemCpuLoad = jmx.getAttribute(nodeName, "SystemCpuLoad") * 100;
		machine.TotalPhysicalMemory = jmx.getAttribute(nodeName, "TotalPhysicalMemorySize");
		machine.FreePhysicalMemory = jmx.getAttribute(nodeName, "FreePhysicalMemorySize");
		machine.PercentageFreeMemory = machine.FreePhysicalMemory * 100 / machine.TotalPhysicalMemory;
		machine.AvailableProcessors = jmx.getAttribute(nodeName, "AvailableProcessors");
		machine.Name = jmx.getAttribute(nodeName, "Name");
	}
	var table = document.getElementById("machine_table");
	for (var i = 0; i < keys.length; i++) {
		var machine = machineMap.get(keys[i]);
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], machine.UnicastAddress);
			setContent(row.cells[1], machine.CoreCount);
			setContent(row.cells[2], machine.LoadAverage);
			setContent(row.cells[3], numberWithCommas(machine.TotalPhysicalMemory));
			setContent(row.cells[4], numberWithCommas(machine.FreePhysicalMemory));
			setContent(row.cells[5], roundXL(machine.PercentageFreeMemory, 2));
			setContent(row.cells[6], machine.AvailableProcessors);
			setContent(row.cells[7], machine.Name);
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), machine.UnicastAddress);
			setContent(row.insertCell(1), machine.CoreCount);
			row.cells[1].style.textAlign = "right";
			setContent(row.insertCell(2), machine.LoadAverage);
			row.cells[2].style.textAlign = "right";
			setContent(row.insertCell(3), numberWithCommas(machine.TotalPhysicalMemory));
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), numberWithCommas(machine.FreePhysicalMemory));
			row.cells[4].style.textAlign = "right";
			setContent(row.insertCell(5), roundXL(machine.PercentageFreeMemory, 2));
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), machine.AvailableProcessors);
			row.cells[6].style.textAlign = "right";
			setContent(row.insertCell(7), machine.Name);
		}
		totalCoreCount = totalCoreCount + machine.CoreCount;
	}
	for (var i = table.rows.length; i > machineMap.size() + 1; i--) {
		table.deleteRow(i - 1);
	}
	document.getElementById('machine_machines').innerHTML = keys.length;
	document.getElementById('machine_cores').innerHTML = totalCoreCount;
	if (machineChart == null) {
		machineChart = AmCharts.makeChart("machineChart", {
				"type" : "serial",
				"theme" : "none",
				"legend" : {
					"useGraphSettings" : true,
					"valueText" : "",
				},
				"valueAxes" : [{
						"unit" : "%",
						"gridAlpha" : 0.07,
						"position" : "left",
						"title" : "Rate"
					}
				],
				"chartCursor" : {
					"categoryBalloonDateFormat" : "JJ:NN:SS",
					"cursorAlpha" : 0.1,
					"fullWidth" : true,
				},
				"categoryField" : "date",
				"categoryAxis" : {
					"minPeriod" : "ss",
					"parseDates" : true,
					"gridAlpha" : 0
				},
			});
	}
	var data = {};
	var machineChartGraph = [];
	data["date"] = new Date();
	for (var i = 0; i < keys.length; i++) {
		var machine = machineMap.get(keys[i]);
		data[machine.UnicastAddress] = machine.SystemCpuLoad;
		machineChartGraph.push({
			"balloonText" : machine.UnicastAddress + "<br>[[value]]%",
			"type" : "step",
			"bullet" : "square",
			"bulletAlpha" : 0,
			"bulletSize" : 4,
			"bulletBorderAlpha" : 0,
			"title" : machine.UnicastAddress,
			"valueField" : machine.UnicastAddress
		});
	}
	if (machineChartData.length >= 50) {
		machineChartData.shift();
	}
	machineChartData.push(data);
	machineChart.graphs = machineChartGraph;
	machineChart.dataProvider = machineChartData;
	machineChart.validateData();
}
