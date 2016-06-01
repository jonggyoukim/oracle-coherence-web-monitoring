function Indexs() {
	var jmx = new Jolokia(jurl);
	var nodeNames = jmx.search("Coherence:type=StorageManager,*");
	nodeNames.sort();
	var cacheMap = new Map();
	for (var i = 0; i < nodeNames.length; i++) {
		var mbeanProperty = {};
		nodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
		var IndexInfo = jmx.getAttribute(nodeNames[i], "IndexInfo");
		var totalIndexSize = 0;
		for (var j = 0; j < IndexInfo.length; j++) {
			var indexProp = {};
			IndexInfo[j].substr(15).split(',').forEach(function (x) {
				var arr = x.split('=');
				if (arr[1] == undefined) {
					indexProp.Extractor = indexProp.Extractor + ", " + arr[0].trim();
				} else {
					indexProp[arr[0].trim()] = arr[1].trim();
				}
			});
			if (endsWith(indexProp.Footprint, "KB")) {
				indexProp.Footprint = indexProp.Footprint.substring(0, indexProp.Footprint.indexOf("KB")) * 1024;
			} else if (endsWith(indexProp.Footprint, "MB")) {
				indexProp.Footprint = indexProp.Footprint.substring(0, indexProp.Footprint.indexOf("MB")) * 1024 * 1024;
			}
			totalIndexSize = parseFloat(totalIndexSize) + parseFloat(indexProp.Footprint);
		}
		var cache = cacheMap.get(mbeanProperty.cache);
		if (cache == null) {
			cache = {
				service : mbeanProperty.service,
				name : mbeanProperty.cache,
				totalNodeCount : 1,
				applyNodeCount : (IndexInfo.length > 0) ? 1 : 0,
				indexCount : IndexInfo.length,
				indexSize : totalIndexSize
			};
			cacheMap.put(mbeanProperty.cache, cache);
		} else {
			cache.totalNodeCount = cache.totalNodeCount + 1;
			if (IndexInfo.length > 0) {
				cache.applyNodeCount = cache.applyNodeCount + 1;
			}
			cache.indexSize = parseFloat(cache.indexSize) + parseFloat(totalIndexSize);
		}
	}
	var table = document.getElementById("index_table");
	var keys = cacheMap.keys();
	for (var i = 0; i < keys.length; i++) {
		var cache = cacheMap.get(keys[i]);
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], cache.service);
			setContent(row.cells[1], cache.name);
			setContent(row.cells[2], cache.applyNodeCount + "/" + cache.totalNodeCount);
			setContent(row.cells[3], numberWithCommas(cache.indexCount));
			setContent(row.cells[4], numberWithCommas(cache.indexSize.toFixed()));
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), cache.service);
			setContent(row.insertCell(1), cache.name);
			setContent(row.insertCell(2), cache.applyNodeCount + "/" + cache.totalNodeCount);
			row.cells[2].style.textAlign = "center";
			setContent(row.insertCell(3), numberWithCommas(cache.indexCount));
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), numberWithCommas(cache.indexSize.toFixed()));
			row.cells[4].style.textAlign = "right";
		}
	}
	for (var i = table.rows.length; i > keys.length + 1; i--) {
		table.deleteRow(i - 1);
	}
	var rows = table.getElementsByTagName('tr');
	for (i = 0; i < rows.length; i++) {
		rows[i].onclick = function () {
			new IndexInfoDetail(table.rows[this.rowIndex].cells[1].innerHTML);
		}
	}
}
function IndexInfoDetail(selectName) {
	document.getElementById('index_selected').innerHTML = selectName;
	var jmx = new Jolokia(jurl);
	var nodeNames = jmx.search("Coherence:type=StorageManager,cache=" + selectName + ",*");
	nodeNames.sort();
	var indexMap = new Map();
	for (var i = 0; i < nodeNames.length; i++) {
		var IndexInfo = jmx.getAttribute(nodeNames[i], "IndexInfo");
		var totalIndexSize
		for (var j = 0; j < IndexInfo.length; j++) {
			var indexProp = {};
			IndexInfo[j].substr(15).split(',').forEach(function (x) {
				var arr = x.split('=');
				if (arr[1] == undefined) {
					indexProp.Extractor = indexProp.Extractor + ", " + arr[0].trim();
				} else {
					indexProp[arr[0].trim()] = arr[1].trim();
				}
			});
			if (endsWith(indexProp.Footprint, "KB")) {
				indexProp.Footprint = parseFloat(indexProp.Footprint.substring(0, indexProp.Footprint.indexOf("KB"))) * 1024;
			} else if (endsWith(indexProp.Footprint, "MB")) {
				indexProp.Footprint = parseFloat(indexProp.Footprint.substring(0, indexProp.Footprint.indexOf("MB"))) * 1024 * 1024;
			}
			var index = indexMap.get(indexProp.Extractor);
			if (index == null) {
				index = {
					Extractor : indexProp.Extractor,
					Ordered : indexProp.Ordered,
					Footprint : parseFloat(indexProp.Footprint),
					Content : parseFloat(indexProp.Content)
				};
				indexMap.put(indexProp.Extractor, index);
			} else {
				index.Footprint = parseFloat(index.Footprint) + parseFloat(indexProp.Footprint);
				index.Content = parseFloat(index.Content) + parseFloat(indexProp.Content);
			}
		}
	}
	var table = document.getElementById("index_info_table");
	var keys = indexMap.keys();
	for (var i = 0; i < keys.length; i++) {
		var index = indexMap.get(keys[i]);
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], index.Extractor);
			setContent(row.cells[1], index.Ordered);
			setContent(row.cells[2], numberWithCommas(index.Footprint));
			setContent(row.cells[3], numberWithCommas(index.Content));
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), index.Extractor);
			setContent(row.insertCell(1), index.Ordered);
			setContent(row.insertCell(2), numberWithCommas(index.Footprint.toFixed()));
			row.cells[2].style.textAlign = "right";
			setContent(row.insertCell(3), numberWithCommas(index.Content));
			row.cells[3].style.textAlign = "right";
		}
	}
	for (var i = table.rows.length; i > keys.length + 1; i--) {
		table.deleteRow(i - 1);
	}
}
