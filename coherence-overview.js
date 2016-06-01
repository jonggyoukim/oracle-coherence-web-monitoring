function Overview() {
	var jmx = new Jolokia(jurl);
	var storageNodeMap = new Map();
	var storageNodeNames = jmx.search("Coherence:type=StorageManager,*");
	for (var i = 0; i < storageNodeNames.length; i++) {
		var mbeanProperty = {};
		storageNodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
		storageNodeMap.put(mbeanProperty.nodeId, mbeanProperty.nodeId);
	}
	var clusterName = jmx.getAttribute("Coherence:type=Cluster", "ClusterName");
	var version = jmx.getAttribute("Coherence:type=Cluster", "Version");
	var memberIds = jmx.getAttribute("Coherence:type=Cluster", "ClusterSize");
	var refreshTime = jmx.getAttribute("Coherence:type=Cluster", "RefreshTime");
	document.getElementById('overview_clustername').innerHTML = clusterName;
	document.getElementById('overview_version').innerHTML = version;
	document.getElementById('overview_members').innerHTML = memberIds;
	document.getElementById('overview_refreshdate').innerHTML = refreshTime;
	var StatusHA = null;
	var nodeNames = jmx.search("Coherence:type=Service,*");
	nodeNames.sort();
	if (nodeNames.length > 0) {
		StatusHA = jmx.getAttribute(nodeNames[0], "StatusHA");
	}
	document.getElementById('overview_status').innerHTML = StatusHA;
	if (memoryChart == null) {
		memoryChart = AmCharts.makeChart("memoryChart", {
				"type" : "serial",
				"theme" : "light",
				"legend" : {
					"valueText" : "[[value]] ([[percents]]%)",
					"valueWidth" : 100
				},
				"valueAxes" : [{
						"stackType" : "regular",
						"title" : "Storage Memory(MB)"
					}
				],
				"graphs" : [{
						"bullet" : "diamond",
						"bulletSize" : 6,
						"bulletAlpha" : 0.5,
						"balloonText" : "<b>Used</b> <span style='font-size:14px; color:#000000;'>[[value]] ([[percents]]%)</span>",
						"fillAlphas" : 0.6,
						"lineAlpha" : 0.4,
						"title" : "Used",
						"valueField" : "used"
					}, {
						"bullet" : "diamond",
						"bulletSize" : 6,
						"bulletAlpha" : 0.5,
						"balloonText" : "<b>Free</b> <span style='font-size:14px; color:#000000;'>[[value]] ([[percents]]%)</span>",
						"fillAlphas" : 0.6,
						"lineAlpha" : 0.4,
						"title" : "Free",
						"valueField" : "free"
					}
				],
				"chartCursor" : {
					"categoryBalloonDateFormat" : "JJ:NN:SS",
				},
				"categoryField" : "date",
				"categoryAxis" : {
					"minPeriod" : "ss",
					"parseDates" : true,
					"gridAlpha" : 0
				},
			});
	} else {
		var nodeNames = jmx.search("Coherence:type=Node,*");
		var totalFree = 0;
		var totalUsed = 0;
		var totalMax = 0;
		for (var i = 0; i < nodeNames.length; i++) {
			var id = jmx.getAttribute(nodeNames[i], "Id");
			if (storageNodeMap.containsKey(id)) {
				var free = jmx.getAttribute(nodeNames[i], "MemoryAvailableMB");
				var max = jmx.getAttribute(nodeNames[i], "MemoryMaxMB");
				totalFree = totalFree + free;
				totalMax = totalMax + max;
			}
		}
		totalUsed = totalMax - totalFree;
		if (memoryChartData.length >= 50) {
			memoryChartData.shift();
		}
		memoryChartData.push({
			"date" : new Date(),
			"used" : totalUsed,
			"free" : totalFree
		});
		memoryChart.dataProvider = memoryChartData;
		memoryChart.validateData();
		document.getElementById('memoryChart_title').innerHTML = "Storage Memory Usage (Total:" + numberWithCommas(totalMax) + "MB)";
	}
	if (networkChart == null) {
		networkChart = AmCharts.makeChart("networkChart", {
				"type" : "serial",
				"theme" : "none",
				"legend" : {
					"useGraphSettings" : true,
					"valueText" : "",
				},
				"valueAxes" : [{
						"title" : "Rate"
					}
				],
				"graphs" : [{
						"bullet" : "square",
						"bulletSize" : 6,
						"title" : "Publisher",
						"valueField" : "PublisherSuccessRate",
					}, {
						"bullet" : "square",
						"bulletSize" : 6,
						"title" : "Receiver",
						"valueField" : "ReceiverSuccessRate",
					}
				],
				"chartCursor" : {
					"categoryBalloonDateFormat" : "JJ:NN:SS",
					"cursorAlpha" : 0.1,
					"fullWidth" : true,
					"graphBulletSize" : 1
				},
				"categoryField" : "date",
				"categoryAxis" : {
					"minPeriod" : "ss",
					"parseDates" : true,
					"gridAlpha" : 0
				},
			});
	} else {
		var nodeNames = jmx.search("Coherence:type=Node,*");
		var totalPublish = 0;
		var totalReceive = 0;
		for (var i = 0; i < nodeNames.length; i++) {
			var publishRate = jmx.getAttribute(nodeNames[i], "PublisherSuccessRate");
			var receiveRate = jmx.getAttribute(nodeNames[i], "ReceiverSuccessRate");
			totalPublish = totalPublish + publishRate;
			totalReceive = totalReceive + receiveRate;
		}
		totalPublish = totalPublish / nodeNames.length;
		totalReceive = totalReceive / nodeNames.length;
		if (networkChartData.length >= 50) {
			networkChartData.shift();
		}
		networkChartData.push({
			"date" : new Date(),
			"PublisherSuccessRate" : totalPublish,
			"ReceiverSuccessRate" : totalReceive
		});
		networkChart.dataProvider = networkChartData;
		networkChart.validateData();
	}
}
