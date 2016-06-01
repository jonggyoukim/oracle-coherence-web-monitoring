var memoryChart;
var memoryChartData = [];
var networkChart;
var networkChartData = [];
var machineChart;
var machineChartData = [];
var partitionChart;
var partitionChartData = [];
var myInterval;
var jurl;
var bgrun;
var overInterval = 5000;
var machInterval = 5000;
var membInterval = 5000;
var servInterval = 30000;
var cachInterval = 30000;
var indeInterval = 30000;
var partInterval = 5000;
var count = 0;
var overi = null;
var machi = null;
var membi = null;
var servi = null;
var cachi = null;
var indei = null;
var parti = null;
$(document).ready(function () {
	bgrun = document.getElementById("bgrun").checked;
	jurl = document.getElementById("jurl").value;
	$(".tab_content").hide();
	$("ul.tabs li:first").addClass("active").show();
	$(".tab_content:first").show();
	$("ul.tabs li").click(function () {
		jurl = document.getElementById("jurl").value;
		$("ul.tabs li").removeClass("active");
		$(this).addClass("active");
		$(".tab_content").hide();
		var activeTab = $(this).find("a").attr("href");
		if (activeTab == '#overview') {
			if (bgrun) {
				if (overi == null) {
					new Overview();
					overi = setInterval(Overview, overInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Overview();
				myInterval = setInterval(Overview, overInterval);
			}
			memoryChart.invalidateSize();
			networkChart.invalidateSize();
		} else if (activeTab == '#machines') {
			if (bgrun) {
				if (machi == null) {
					new Machines();
					machi = setInterval(Machines, machInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Machines();
				myInterval = setInterval(Machines, machInterval);
			}
			machineChart.invalidateSize();
		} else if (activeTab == '#members') {
			if (bgrun) {
				if (membi == null) {
					new Members();
					membi = setInterval(Members, membInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Members();
				myInterval = setInterval(Members, membInterval);
			}
		} else if (activeTab == '#services') {
			if (bgrun) {
				if (servi == null) {
					new Services();
					servi = setInterval(Services, servInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Services();
				myInterval = setInterval(Services, servInterval);
			}
		} else if (activeTab == '#caches') {
			if (bgrun) {
				if (cachi == null) {
					new Caches();
					cachi = setInterval(Caches, cachInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Caches();
				myInterval = setInterval(Caches, cachInterval);
			}
		} else if (activeTab == '#indexs') {
			if (bgrun) {
				if (indei == null) {
					new Indexs();
					indei = setInterval(Indexs, indeInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Indexs();
				myInterval = setInterval(Indexs, indeInterval);
			}
		} else if (activeTab == '#partition') {
			if (bgrun) {
				if (parti == null) {
					new Partition();
					parti = setInterval(Partition, partInterval);
				}
			} else {
				new stopInterval(myInterval);
				new Partition();
				myInterval = setInterval(Partition, partInterval);
			}
			partitionChart.invalidateSize();
		};
		$(activeTab).fadeIn();
		return false;
	});
	new Overview();
	myInterval = setInterval(Overview, overInterval);
});
function stopInterval(x) {
	if (x != null && x != undefined) {
		clearInterval(x);
	}
}
function numberWithCommas(x) {
	if (jQuery.isNumeric(x) == false) {
		return x;
	} else {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
}
function setContent(cell, content) {
	cell.innerHTML = content;
	cell.style.border = "1px solid #aaa";
	cell.style.padding = "5px";
}
function endsWith(st, suffix) {
	var str = st.toString();
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function getProperty(str, type) {
	str.substringindexOf(type)
}
Map = function () {
	this.map = new Object();
};
Map.prototype = {
	put : function (key, value) {
		this.map[key] = value;
	},
	get : function (key) {
		return this.map[key];
	},
	containsKey : function (key) {
		return key in this.map;
	},
	containsValue : function (value) {
		for (var prop in this.map) {
			if (this.map[prop] == value)
				return true;
		}
		return false;
	},
	isEmpty : function (key) {
		return (this.size() == 0);
	},
	clear : function () {
		for (var prop in this.map) {
			delete this.map[prop];
		}
	},
	remove : function (key) {
		delete this.map[key];
	},
	keys : function () {
		var keys = new Array();
		for (var prop in this.map) {
			keys.push(prop);
		}
		return keys;
	},
	values : function () {
		var values = new Array();
		for (var prop in this.map) {
			values.push(this.map[prop]);
		}
		return values;
	},
	size : function () {
		var count = 0;
		for (var prop in this.map) {
			count++;
		}
		return count;
	}
};
function setup() {
	jurl = document.getElementById("jurl").value;
	overInterval = document.getElementById("overInterval").value;
	machInterval = document.getElementById("machInterval").value;
	membInterval = document.getElementById("membInterval").value;
	servInterval = document.getElementById("servInterval").value;
	cachInterval = document.getElementById("cachInterval").value;
	indeInterval = document.getElementById("indeInterval").value;
	partInterval = document.getElementById("partInterval").value;
	bgrun = document.getElementById("bgrun").checked;
	if (bgrun) {
		new stopInterval(myInterval);
	} else {
		new stopInterval(overi);
		new stopInterval(machi);
		new stopInterval(membi);
		new stopInterval(servi);
		new stopInterval(cachi);
		new stopInterval(indei);
		new stopInterval(parti);
	}
	var str = "Jolokia URL = " + jurl + "\n";
	var str = str + "Overview Interval = " + overInterval + "\n";
	var str = str + "Machine Interval = " + machInterval + "\n";
	var str = str + "Members Interval = " + membInterval + "\n";
	var str = str + "ServicesInterval = " + servInterval + "\n";
	var str = str + "Caches Interval = " + cachInterval + "\n";
	var str = str + "Indexs Interval = " + indeInterval + "\n";
	var str = str + "Partitions Interval = " + partInterval + "\n";
	var str = str + "Background running = " + bgrun;
	alert(str)
}
function roundXL(n, digits) {
	if (digits >= 0)
		return parseFloat(n.toFixed(digits));
	digits = Math.pow(10, digits);
	var t = Math.round(n * digits) / digits;
	return parseFloat(t.toFixed(0));
}
