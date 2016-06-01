function Members() {
	var jmx = new Jolokia(jurl);
	var total_cluster_mem = 0;
	var total_cluster_used = 0;
	var total_cluster_free = 0;
	var total_storage_mem = 0;
	var total_storage_used = 0;
	var total_storage_free = 0;
	var chartData = [];
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
	var nodeNames = jmx.search("Coherence:type=Node,*");
	nodeNames.sort();
	var table = document.getElementById("member_table");
	for (var i = 0; i < nodeNames.length; i++) {
		var Id = jmx.getAttribute(nodeNames[i], "Id");
		var UnicastAddress = jmx.getAttribute(nodeNames[i], "UnicastAddress");
		var UnicastPort = jmx.getAttribute(nodeNames[i], "UnicastPort");
		var RoleName = jmx.getAttribute(nodeNames[i], "RoleName");
		var PublisherSuccessRate = jmx.getAttribute(nodeNames[i], "PublisherSuccessRate");
		var ReceiverSuccessRate = jmx.getAttribute(nodeNames[i], "ReceiverSuccessRate");
		var SendQueueSize = jmx.getAttribute(nodeNames[i], "SendQueueSize");
		var MemoryMaxMB = jmx.getAttribute(nodeNames[i], "MemoryMaxMB");
		var MemoryAvailableMB = jmx.getAttribute(nodeNames[i], "MemoryAvailableMB");
		var Name = jmx.getAttribute("Coherence:type=Platform,Domain=java.lang,subType=Runtime,nodeId=" + Id, "Name");
		Name = Name.substr(0,Name.indexOf("@"));
		var Storage = storageNodeMap.containsKey(Id);
		if (Storage == true) {
			total_storage_mem = total_storage_mem + MemoryMaxMB;
			total_storage_free = total_storage_free + MemoryAvailableMB;
			total_storage_used = total_storage_mem - total_storage_free;
		}
		total_cluster_mem = total_cluster_mem + MemoryMaxMB;
		total_cluster_free = total_cluster_free + MemoryAvailableMB;
		total_cluster_used = total_cluster_mem - total_cluster_free;
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], Id);
			setContent(row.cells[1], UnicastAddress);
			setContent(row.cells[2], UnicastPort);
			setContent(row.cells[3], Name);
			setContent(row.cells[4], RoleName);
			setContent(row.cells[5], Storage);
			setContent(row.cells[6], numberWithCommas(MemoryMaxMB));
			setContent(row.cells[7], numberWithCommas(MemoryMaxMB - MemoryAvailableMB));
			setContent(row.cells[8], numberWithCommas(MemoryAvailableMB));
			setContent(row.cells[9], roundXL(PublisherSuccessRate, 4));
			setContent(row.cells[10], roundXL(ReceiverSuccessRate, 4));
			setContent(row.cells[11], SendQueueSize);
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), Id);
			setContent(row.insertCell(1), UnicastAddress);
			setContent(row.insertCell(2), UnicastPort);
			setContent(row.insertCell(3), Name);
			setContent(row.insertCell(4), RoleName);
			setContent(row.insertCell(5), Storage);
			setContent(row.insertCell(6), numberWithCommas(MemoryMaxMB));
			row.cells[6].style.textAlign = "right";
			setContent(row.insertCell(7), numberWithCommas(MemoryMaxMB - MemoryAvailableMB));
			row.cells[7].style.textAlign = "right";
			setContent(row.insertCell(8), numberWithCommas(MemoryAvailableMB));
			row.cells[8].style.textAlign = "right";
			setContent(row.insertCell(9), roundXL(PublisherSuccessRate, 4));
			row.cells[9].style.textAlign = "right";
			setContent(row.insertCell(10), roundXL(ReceiverSuccessRate, 4));
			row.cells[10].style.textAlign = "right";
			setContent(row.insertCell(11), SendQueueSize);
			row.cells[11].style.textAlign = "right";
		}
	}
	for (var i = table.rows.length; i > nodeNames.length + 1; i--) {
		table.deleteRow(i - 1);
	}
	chartData.push({
		"date" : new Date(),
		"free" : total_storage_free,
		"used" : total_storage_used
	});
	document.getElementById('member_cluster').innerHTML = jmx.getAttribute("Coherence:type=Cluster", "ClusterName");
	document.getElementById('member_license').innerHTML = jmx.getAttribute("Coherence:type=Cluster", "LicenseMode");
	document.getElementById('member_oldest').innerHTML = jmx.getAttribute("Coherence:type=Cluster", "OldestMemberId");
	document.getElementById('member_version').innerHTML = jmx.getAttribute("Coherence:type=Cluster", "Version");
	document.getElementById('member_members').innerHTML = nodeNames.length;
	document.getElementById('member_departure').innerHTML = jmx.getAttribute("Coherence:type=Cluster", "MembersDepartureCount");
	document.getElementById('member_cluster_maxmem').innerHTML = numberWithCommas(total_cluster_mem);
	document.getElementById('member_cluster_usedmem').innerHTML = numberWithCommas(total_cluster_used);
	document.getElementById('member_cluster_freemem').innerHTML = numberWithCommas(total_cluster_free);
	document.getElementById('member_storage_maxmem').innerHTML = numberWithCommas(total_storage_mem);
	document.getElementById('member_storage_usedmem').innerHTML = numberWithCommas(total_storage_used);
	document.getElementById('member_storage_freemem').innerHTML = numberWithCommas(total_storage_free);
	document.getElementById('member_memoryChart_title').innerHTML = numberWithCommas("Total Storage Memory : " + numberWithCommas(total_storage_mem) + "MB");
	var memoryChart = AmCharts.makeChart("member_memoryChart", {
			"type" : "serial",
			"theme" : "light",
			"dataProvider" : chartData,
			"startDuration" : 1,
			"valueAxes" : [{
					"stackType" : "100%",
				}
			],
			"graphs" : [{
					"balloonText" : "<b>[[title]]</b> [[value]]([[percents]]%)",
					"fillAlphas" : 0.8,
					"labelText" : "[[title]]",
					"title" : "Used",
					"type" : "column",
					"color" : "#000000",
					"valueField" : "used"
				}, {
					"balloonText" : "<b>[[title]]</b> [[value]]([[percents]]%)",
					"fillAlphas" : 0.8,
					"labelText" : "[[title]]",
					"title" : "Free",
					"type" : "column",
					"color" : "#000000",
					"valueField" : "free"
				}
			],
			"rotate" : true,
			"marginTop" : 0,
			"marginRight" : 0,
			"marginLeft" : 0,
			"marginBottom" : 0,
			"autoMargins" : false,
			"categoryField" : "date",
			"categoryAxis" : {
				"labelsEnabled" : false,
				"tickLength" : 0
			},
		});
	memoryChart.invalidateSize();
}
