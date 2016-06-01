function Partition() {
	var jmx = new Jolokia(jurl);
	var nodeNames = jmx.search("Coherence:type=PartitionAssignment,*");
	var table = document.getElementById("partition_table");
	var data = {};
	var partitionChartGraph = [];
	data["date"] = new Date();
	for (var i = 0; i < nodeNames.length; i++) {
		var mbeanProperty = {};
		nodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
		var BackupCount = jmx.getAttribute(nodeNames[i], "BackupCount");
		var CoordinatorId = jmx.getAttribute(nodeNames[i], "CoordinatorId");
		var FairShareBackup = jmx.getAttribute(nodeNames[i], "FairShareBackup");
		var FairSharePrimary = jmx.getAttribute(nodeNames[i], "FairSharePrimary");
		var PartitionCount = jmx.getAttribute(nodeNames[i], "PartitionCount");
		var ServiceMachineCount = jmx.getAttribute(nodeNames[i], "ServiceMachineCount");
		var ServiceNodeCount = jmx.getAttribute(nodeNames[i], "ServiceNodeCount");
		var StrategyName = jmx.getAttribute(nodeNames[i], "StrategyName");
		var RemainingDistributionCount = jmx.getAttribute(nodeNames[i], "RemainingDistributionCount");
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], mbeanProperty.responsibility);
			setContent(row.cells[1], BackupCount);
			setContent(row.cells[2], CoordinatorId);
			setContent(row.cells[3], FairShareBackup);
			setContent(row.cells[4], FairSharePrimary);
			setContent(row.cells[5], PartitionCount);
			setContent(row.cells[6], ServiceMachineCount);
			setContent(row.cells[7], ServiceNodeCount);
			setContent(row.cells[8], StrategyName);
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), mbeanProperty.responsibility);
			setContent(row.insertCell(1), BackupCount);
			row.cells[1].style.textAlign = "right";
			setContent(row.insertCell(2), CoordinatorId);
			row.cells[2].style.textAlign = "right";
			setContent(row.insertCell(3), FairShareBackup);
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), FairSharePrimary);
			row.cells[4].style.textAlign = "right";
			setContent(row.insertCell(5), PartitionCount);
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), ServiceMachineCount);
			row.cells[6].style.textAlign = "right";
			setContent(row.insertCell(7), ServiceNodeCount);
			row.cells[7].style.textAlign = "right";
			setContent(row.insertCell(8), StrategyName);
		}
		if (partitionChart == null) {
			partitionChart = AmCharts.makeChart("partitionChart", {
					"type" : "serial",
					"theme" : "none",
					"legend" : {
						"useGraphSettings" : true,
					},
					"valueAxes" : [{
							"gridAlpha" : 0.07,
							"position" : "left",
							"title" : "Count"
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
		data[mbeanProperty.responsibility] = RemainingDistributionCount;
		partitionChartGraph.push({
			"balloonText" : mbeanProperty.responsibility + "<br>[[value]]",
			"type" : "step",
			"bullet" : "square",
			"bulletAlpha" : 0,
			"bulletSize" : 4,
			"bulletBorderAlpha" : 0,
			"title" : mbeanProperty.responsibility,
			"valueField" : mbeanProperty.responsibility
		});
	}
	if (partitionChartData.length >= 50) {
		partitionChartData.shift();
	}
	partitionChartData.push(data);
	partitionChart.graphs = partitionChartGraph;
	partitionChart.dataProvider = partitionChartData;
	partitionChart.validateData();
}
