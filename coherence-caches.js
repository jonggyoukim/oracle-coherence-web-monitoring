function Caches() {
	var jmx = new Jolokia(jurl);
	var chartData = [];
	var totalMemoryMaxMB = 0;
	var totalMemoryAvailableMB = 0;
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
	for (var i = 0; i < nodeNames.length; i++) {
		var id = jmx.getAttribute(nodeNames[i], "Id");
		if (storageNodeMap.containsKey(id)) {
			var MemoryMaxMB = jmx.getAttribute(nodeNames[i], "MemoryMaxMB");
			totalMemoryMaxMB = totalMemoryMaxMB + MemoryMaxMB;
			var MemoryAvailableMB = jmx.getAttribute(nodeNames[i], "MemoryAvailableMB");
			totalMemoryAvailableMB = totalMemoryAvailableMB + MemoryAvailableMB;
		}
	}
	var total_back_mem = 0;
	var total_front_mem = 0;
	var backCacheMap = new Map();
	var frontCacheMap = new Map();
	nodeNames = jmx.search("Coherence:type=Cache,*");
	nodeNames.sort();
	for (var i = 0; i < nodeNames.length; i++) {
		var size = jmx.getAttribute(nodeNames[i], "Size");
		var MemoryUnits = jmx.getAttribute(nodeNames[i], "MemoryUnits");
		var UnitFactor = jmx.getAttribute(nodeNames[i], "UnitFactor");
		var memory = jmx.getAttribute(nodeNames[i], "Units");
		var ExpiryDelay = jmx.getAttribute(nodeNames[i], "ExpiryDelay");
		if (MemoryUnits == true) {
			memory = memory * UnitFactor;
		} else {
			memory = 0;
		}
		var mbeanProperty = {};
		nodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
		var BackupCount = jmx.getAttribute("Coherence:type=Service,name=" + mbeanProperty.service + ",nodeId=" + mbeanProperty.nodeId, "BackupCount");
		if (mbeanProperty.tier == "back") {
			var cacheKey = mbeanProperty.service + " / " + mbeanProperty.name;
			var cache = backCacheMap.get(cacheKey);
			if (cache == null) {
				cache = {
					service : mbeanProperty.service,
					cache : mbeanProperty.name,
					backup : BackupCount,
					name : cacheKey,
					size : size,
					memory : memory,
					memoryMB : memory / 1024,
					objectSize : memory / size,
					ExpiryDelay : ExpiryDelay
				};
				backCacheMap.put(cacheKey, cache);
			} else {
				cache.size = cache.size + size;
				cache.memory = cache.memory + memory;
				cache.memoryMB = cache.memory / 1024;
				cache.objectSize = cache.memory / cache.size;
			}
			total_back_mem = total_back_mem + memory;
		} else {
			var cacheKey = mbeanProperty.service + " / " + mbeanProperty.name;
			var cache = frontCacheMap.get(cacheKey);
			if (cache == null) {
				cache = {
					service : mbeanProperty.service,
					cache : mbeanProperty.name,
					backup : BackupCount,
					name : cacheKey,
					size : size,
					memory : memory,
					memoryMB : memory / 1024,
					objectSize : memory / size,
					ExpiryDelay : ExpiryDelay
				};
				frontCacheMap.put(cacheKey, cache);
			} else {
				cache.size = cache.size + size;
				cache.memory = cache.memory + memory;
				cache.memoryMB = cache.memory / 1024;
				cache.objectSize = cache.memory / cache.size;
			}
			total_front_mem = total_front_mem + memory;
		}
	}
	var totalRealMemory = 0;
	var back_table = document.getElementById("cache_back_table");
	var back_keys = backCacheMap.keys();
	for (var i = 0; i < back_keys.length; i++) {
		var cache = backCacheMap.get(back_keys[i]);
		var realMemory = cache.backup * cache.memory;
		totalRealMemory = totalRealMemory + realMemory;
		chartData.push({
			name : cache.cache,
			size : realMemory
		});
		if (i + 1 < back_table.rows.length) {
			var row = back_table.rows[i + 1];
			setContent(row.cells[0], "back cache");
			setContent(row.cells[1], cache.name);
			setContent(row.cells[2], cache.size);
			setContent(row.cells[3], numberWithCommas((cache.memory == 0) ? "-" : cache.memory));
			setContent(row.cells[4], numberWithCommas((cache.memoryMB == 0) ? "-" : roundXL(cache.memoryMB, 2)));
			setContent(row.cells[5], numberWithCommas((cache.objectSize == 0) ? "-" : roundXL(cache.objectSize, 2)));
			setContent(row.cells[6], numberWithCommas(cache.ExpiryDelay));
		} else {
			var row = back_table.insertRow(back_table.rows.length);
			setContent(row.insertCell(0), "back cache");
			setContent(row.insertCell(1), cache.name);
			setContent(row.insertCell(2), cache.size);
			row.cells[2].style.textAlign = "right";
			setContent(row.insertCell(3), numberWithCommas((cache.memory == 0) ? "-" : cache.memory));
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), numberWithCommas((cache.memoryMB == 0) ? "-" : roundXL(cache.memoryMB, 2)));
			row.cells[4].style.textAlign = "right";
			setContent(row.insertCell(5), numberWithCommas((cache.objectSize == 0) ? "-" : roundXL(cache.objectSize, 2)));
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), numberWithCommas(cache.ExpiryDelay));
			row.cells[6].style.textAlign = "right";
		}
	}
	for (var i = back_table.rows.length; i > back_keys.length + 1; i--) {
		back_table.deleteRow(i - 1);
	}
	chartData.push({
		name : 'FREE',
		size : totalMemoryAvailableMB
	});
	chartData.push({
		name : 'BASIC',
		size : ((totalMemoryMaxMB - totalMemoryAvailableMB) - (totalRealMemory / 1024))
	});
	var front_table = document.getElementById("cache_front_table");
	var front_keys = frontCacheMap.keys();
	for (var i = 0; i < front_keys.length; i++) {
		var cache = frontCacheMap.get(front_keys[i]);
		if (i + 1 < front_table.rows.length) {
			var row = front_table.rows[i + 1];
			setContent(row.cells[0], "front cache");
			setContent(row.cells[1], cache.name);
			setContent(row.cells[2], cache.size);
			setContent(row.cells[3], numberWithCommas((cache.memory == 0) ? "-" : cache.memory));
			setContent(row.cells[4], numberWithCommas((cache.memoryMB == 0) ? "-" : cache.memoryMB.toFixed()));
			setContent(row.cells[5], numberWithCommas((cache.objectSize == 0) ? "-" : cache.objectSize.toFixed()));
			setContent(row.cells[6], numberWithCommas(cache.ExpiryDelay));
		} else {
			var row = front_table.insertRow(front_table.rows.length);
			setContent(row.insertCell(0), "front cache");
			setContent(row.insertCell(1), cache.name);
			setContent(row.insertCell(2), cache.size);
			row.cells[2].style.textAlign = "right";
			setContent(row.insertCell(3), numberWithCommas((cache.memory == 0) ? "-" : cache.memory));
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), numberWithCommas((cache.memoryMB == 0) ? "-" : cache.memoryMB.toFixed()));
			row.cells[4].style.textAlign = "right";
			setContent(row.insertCell(5), numberWithCommas((cache.objectSize == 0) ? "-" : cache.objectSize.toFixed()));
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), numberWithCommas(cache.ExpiryDelay));
			row.cells[6].style.textAlign = "right";
		}
	}
	for (var i = front_table.rows.length; i > front_keys.length + 1; i--) {
		front_table.deleteRow(i - 1);
	}
	document.getElementById('cahce_totalBackCount').innerHTML = numberWithCommas(backCacheMap.size());
	document.getElementById('cahce_totalFrontCount').innerHTML = numberWithCommas(frontCacheMap.size());
	document.getElementById('cache_totalBackMemory').innerHTML = numberWithCommas(roundXL(total_back_mem / 1024, 2));
	document.getElementById('cache_totalFrontMemory').innerHTML = numberWithCommas(roundXL(total_front_mem / 1024, 2));
	document.getElementById('cache_totalMemory').innerHTML = "Total Storage Memory : " + numberWithCommas(totalMemoryMaxMB) + "MB";
	var cacheChart = AmCharts.makeChart("cache_memoryChart", {
			"type" : "pie",
			"theme" : "none",
			"dataProvider" : chartData,
			"titleField" : "name",
			"valueField" : "size",
			"labelRadius" : 3,
			"radius" : "30%",
			"innerRadius" : "20%",
			"labelText" : "[[title]]"
		});
	var back_rows = back_table.getElementsByTagName('tr');
	for (i = 0; i < back_rows.length; i++) {
		back_rows[i].onclick = function () {
			new CacheNodes(back_table.rows[this.rowIndex].cells[1].innerHTML);
		}
	}
	var front_rows = front_table.getElementsByTagName('tr');
	for (i = 0; i < front_rows.length; i++) {
		front_rows[i].onclick = function () {
			new CacheNodes(front_table.rows[this.rowIndex].cells[1].innerHTML);
		}
	}
}
function CacheNodes(selectName) {
	document.getElementById('cahce_selected').innerHTML = selectName;
	var splitName = selectName.split("/");
	var serviceName = splitName[0].trim();
	var cacheName = splitName[1].trim();
	var jmx = new Jolokia(jurl);
	var cacheNodeNames = jmx.search("Coherence:type=Cache,service=" + serviceName + ",name=" + cacheName + ",*");
	cacheNodeNames.sort();
	for (var i = 0; i < cacheNodeNames.length; i++) {
		var mbeanProperty = {};
		cacheNodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
		var Name = jmx.getAttribute("Coherence:type=Platform,Domain=java.lang,subType=Runtime,nodeId=" + mbeanProperty.nodeId, "Name");
		Name = Name.substr(0,Name.indexOf("@"));
		var Id = mbeanProperty.nodeId;
		var Tier = mbeanProperty.tier;
		var Size = jmx.getAttribute(cacheNodeNames[i], "Size");
		var MemoryUnits = jmx.getAttribute(cacheNodeNames[i], "MemoryUnits");
		var UnitFactor = jmx.getAttribute(cacheNodeNames[i], "UnitFactor");
		var Units = jmx.getAttribute(cacheNodeNames[i], "Units");
		var TotalGets = jmx.getAttribute(cacheNodeNames[i], "TotalGets");
		var TotalPuts = jmx.getAttribute(cacheNodeNames[i], "TotalPuts");
		var CacheHits = jmx.getAttribute(cacheNodeNames[i], "CacheHits");
		var CacheMisses = jmx.getAttribute(cacheNodeNames[i], "CacheMisses");
		var HitProbability = jmx.getAttribute(cacheNodeNames[i], "HitProbability");
		if (MemoryUnits == true) {
			Units = Units * UnitFactor;
		} else {
			Units = 0;
		}
		var MaxQueryDurationMillis = 0;
		if (serviceName == "DistributedCache" && mbeanProperty.tier == "back") {
			MaxQueryDurationMillis = jmx.getAttribute("Coherence:type=StorageManager,service=" + serviceName + ",cache=" + cacheName + ",nodeId=" + Id, "MaxQueryDurationMillis");
		}
		var node_table = document.getElementById("cache_node_table");
		if (i + 1 < node_table.rows.length) {
			var row = node_table.rows[i + 1];
			setContent(row.cells[0], Id);
			setContent(row.cells[1], Tier);
			setContent(row.cells[2], Name);
			setContent(row.cells[3], numberWithCommas(Size));
			setContent(row.cells[4], (MemoryUnits == true) ? "binary" : "fixed");
			setContent(row.cells[5], numberWithCommas((Units == 0) ? "-" : Units));
			setContent(row.cells[6], numberWithCommas(TotalGets));
			setContent(row.cells[7], numberWithCommas(TotalPuts));
			setContent(row.cells[8], numberWithCommas(CacheHits));
			setContent(row.cells[9], numberWithCommas(CacheMisses));
			setContent(row.cells[10], numberWithCommas(roundXL(HitProbability,1)) + "%");
			setContent(row.cells[11], numberWithCommas(MaxQueryDurationMillis));
		} else {
			var row = node_table.insertRow(node_table.rows.length);
			setContent(row.insertCell(0), Id);
			row.cells[0].style.textAlin = "right";
			setContent(row.insertCell(1), Tier);
			setContent(row.insertCell(2), Name);
			setContent(row.insertCell(3), numberWithCommas(Size));
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), (MemoryUnits == true) ? "binary" : "fixed");
			setContent(row.insertCell(5), numberWithCommas((Units == 0) ? "-" : Units));
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), numberWithCommas(TotalGets));
			row.cells[6].style.textAlign = "right";
			setContent(row.insertCell(7), numberWithCommas(TotalPuts));
			row.cells[7].style.textAlign = "right";
			setContent(row.insertCell(8), numberWithCommas(CacheHits));
			row.cells[8].style.textAlign = "right";
			setContent(row.insertCell(9), numberWithCommas(CacheMisses));
			row.cells[9].style.textAlign = "right";
			setContent(row.insertCell(10), numberWithCommas(roundXL(HitProbability,1)) + "%");
			row.cells[10].style.textAlign = "right";
			setContent(row.insertCell(11), numberWithCommas(MaxQueryDurationMillis));
			row.cells[11].style.textAlign = "right";
		}
	}
	for (var i = node_table.rows.length; i > cacheNodeNames.length + 1; i--) {
		node_table.deleteRow(i - 1);
	}
}
