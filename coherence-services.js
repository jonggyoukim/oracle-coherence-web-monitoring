function Services() {
	var jmx = new Jolokia(jurl);
	var nodeNames = jmx.search("Coherence:type=Service,*");
	nodeNames.sort();
	var serviceMap = new Map();
	for (var i = 0; i < nodeNames.length; i++) {
		var mbeanProperty = {};
		nodeNames[i].substr(10).split(',').forEach(function (x) {
			var arr = x.split('=');
			arr[1] && (mbeanProperty[arr[0]] = arr[1]);
		});
			
		var ServiceName = mbeanProperty.name;
		var ServiceType = jmx.getAttribute(nodeNames[i], "Type");
		var StatusHA = jmx.getAttribute(nodeNames[i], "StatusHA");
		var BackupCount = jmx.getAttribute(nodeNames[i], "BackupCount");
		var MemberCount = jmx.getAttribute(nodeNames[i], "MemberCount");
		var StorageEnabledCount = jmx.getAttribute(nodeNames[i], "StorageEnabledCount");
		var PartitionsAll = jmx.getAttribute(nodeNames[i], "PartitionsAll");
		var PartitionsEndangered = jmx.getAttribute(nodeNames[i], "PartitionsEndangered");
		var PartitionsVulnerable = jmx.getAttribute(nodeNames[i], "PartitionsVulnerable");
		var PartitionsUnbalanced = jmx.getAttribute(nodeNames[i], "PartitionsUnbalanced");
		var RequestPendingCount = jmx.getAttribute(nodeNames[i], "RequestPendingCount");
		var SeniorMemberId = jmx.getAttribute(nodeNames[i], "SeniorMemberId");
		var service = serviceMap.get(ServiceName);
		if (service == null) {
			var service = {
				ServiceName : ServiceName,
				ServiceType : ServiceType,
				StatusHA : StatusHA,
				BackupCount : BackupCount,
				MemberCount : MemberCount,
				StorageEnabled : StorageEnabledCount,
				Partitions : PartitionsAll,
				Endangered : PartitionsEndangered,
				Vulnerable : PartitionsVulnerable,
				Unbalanced : PartitionsUnbalanced,
				Pending : RequestPendingCount,
				SeniorMemberId : SeniorMemberId
			};
			serviceMap.put(ServiceName, service);
		} else {
			service.StatusHA = StatusHA,
			service.BackupCount = BackupCount,
			service.MemberCount = MemberCount,
			service.StorageEnabled = StorageEnabledCount,
			service.Partitions = PartitionsAll,
			service.Endangered = PartitionsEndangered,
			service.Vulnerable = PartitionsVulnerable,
			service.Unbalanced = PartitionsUnbalanced,
			service.Pending = RequestPendingCount,
			SeniorMemberId = SeniorMemberId
		}
	}
	var table = document.getElementById("service_table");
	var keys = serviceMap.keys();
	for (var i = 0; i < serviceMap.size(); i++) {
		var service = serviceMap.get(keys[i]);
		if (i + 1 < table.rows.length) {
			var row = table.rows[i + 1];
			setContent(row.cells[0], service.ServiceName);
			setContent(row.cells[1], service.ServiceType);
			setContent(row.cells[2], service.StatusHA);
			setContent(row.cells[3], service.BackupCount);
			setContent(row.cells[4], service.MemberCount);
			setContent(row.cells[5], service.StorageEnabled);
			setContent(row.cells[6], service.Partitions);
			setContent(row.cells[7], service.Endangered);
			setContent(row.cells[8], service.Vulnerable);
			setContent(row.cells[9], service.Unbalanced);
			setContent(row.cells[10], service.Pending);
			setContent(row.cells[11], service.SeniorMemberId);
		} else {
			var row = table.insertRow(table.rows.length);
			setContent(row.insertCell(0), service.ServiceName);
			setContent(row.insertCell(1), service.ServiceType);
			setContent(row.insertCell(2), service.StatusHA);
			setContent(row.insertCell(3), service.BackupCount);
			row.cells[3].style.textAlign = "right";
			setContent(row.insertCell(4), service.MemberCount);
			row.cells[4].style.textAlign = "right";
			setContent(row.insertCell(5), service.StorageEnabled);
			row.cells[5].style.textAlign = "right";
			setContent(row.insertCell(6), service.Partitions);
			row.cells[6].style.textAlign = "right";
			setContent(row.insertCell(7), service.Endangered);
			row.cells[7].style.textAlign = "right";
			setContent(row.insertCell(8), service.Vulnerable);
			row.cells[8].style.textAlign = "right";
			setContent(row.insertCell(9), service.Unbalanced);
			row.cells[9].style.textAlign = "right";
			setContent(row.insertCell(10), service.Pending);
			row.cells[10].style.textAlign = "right";
			setContent(row.insertCell(11), service.SeniorMemberId);
			row.cells[11].style.textAlign = "right";
		}
	}
	for (var i = table.rows.length; i > serviceMap.size() + 1; i--) {
		table.deleteRow(i - 1);
	}
	var rows = table.getElementsByTagName('tr');
	for (i = 0; i < rows.length; i++) {
		rows[i].onclick = function () {
			new ServiceNodes(table.rows[this.rowIndex].cells[0].innerHTML);
		}
	}
	function ServiceNodes(selectName) {
		var jmx = new Jolokia(jurl);
		var nodeNames = jmx.search("Coherence:type=Service,name=" + selectName + ",*");
		nodeNames.sort();
		var totalThreadCount = 0;
		var totalThreadIdleCount = 0;
		var totalThreadUtil = 0;
		for (var i = 0; i < nodeNames.length; i++) {
			var mbeanProperty = {};
			nodeNames[i].substr(10).split(',').forEach(function (x) {
				var arr = x.split('=');
				arr[1] && (mbeanProperty[arr[0]] = arr[1]);
			});
			var Id = mbeanProperty.nodeId;
			var ThreadCount = jmx.getAttribute(nodeNames[i], "ThreadCount");
			var ThreadIdleCount = jmx.getAttribute(nodeNames[i], "ThreadIdleCount");
			var ThreadUtil = (ThreadCount - ThreadIdleCount) / ThreadCount;
			var TaskAverageDuration = jmx.getAttribute(nodeNames[i], "TaskAverageDuration");
			var TaskBacklog = jmx.getAttribute(nodeNames[i], "TaskBacklog");
			var RequestAverageDuration = jmx.getAttribute(nodeNames[i], "RequestAverageDuration");
			var RequestTotalCount = jmx.getAttribute(nodeNames[i], "RequestTotalCount");
			var Statistics = jmx.getAttribute(nodeNames[i], "Statistics");
			totalThreadCount = totalThreadCount + ThreadCount;
			totalThreadIdleCount = (ThreadIdleCount < 0) ? ThreadIdleCount : totalThreadIdleCount + ThreadIdleCount;
			totalThreadUtil = totalThreadUtil + ThreadUtil;
			var node_table = document.getElementById("service_node_table");
			if (i + 1 < node_table.rows.length) {
				var row = node_table.rows[i + 1];
				setContent(row.cells[0], Id);
				setContent(row.cells[1], numberWithCommas(ThreadCount));
				setContent(row.cells[2], numberWithCommas(ThreadIdleCount));
				setContent(row.cells[3], ThreadUtil);
				setContent(row.cells[4], TaskAverageDuration);
				setContent(row.cells[5], numberWithCommas(TaskBacklog));
				setContent(row.cells[6], numberWithCommas(roundXL(RequestAverageDuration, 3)));
				setContent(row.cells[7], numberWithCommas(RequestTotalCount));
				setContent(row.cells[8], Statistics);
			} else {
				var row = node_table.insertRow(node_table.rows.length);
				setContent(row.insertCell(0), Id);
				setContent(row.insertCell(1), numberWithCommas(ThreadCount));
				row.cells[1].style.textAlign = "right";
				setContent(row.insertCell(2), numberWithCommas(ThreadIdleCount));
				row.cells[2].style.textAlign = "right";
				setContent(row.insertCell(3), ThreadUtil);
				row.cells[3].style.textAlign = "right";
				setContent(row.insertCell(4), TaskAverageDuration);
				row.cells[4].style.textAlign = "right";
				setContent(row.insertCell(5), numberWithCommas(TaskBacklog));
				row.cells[5].style.textAlign = "right";
				setContent(row.insertCell(6), numberWithCommas(roundXL(RequestAverageDuration, 3)));
				row.cells[6].style.textAlign = "right";
				setContent(row.insertCell(7), numberWithCommas(RequestTotalCount));
				row.cells[7].style.textAlign = "right";
				setContent(row.insertCell(8), Statistics);
			}
		}
		for (var i = node_table.rows.length; i > nodeNames.length + 1; i--) {
			node_table.deleteRow(i - 1);
		}
		document.getElementById('service_selected').innerHTML = selectName;
		document.getElementById('service_totalThreads').innerHTML = totalThreadCount;
		document.getElementById('service_totalIdel').innerHTML = totalThreadIdleCount;
		document.getElementById('service_totalUtilization').innerHTML = totalThreadUtil / nodeNames.length;
	}
}
