 
// Make a namespace.
if (typeof ExtendedArt == 'undefined') {
  var ExtendedArt = {};
};

ExtendedArt.lib = {
	preferenceService: null,
	consoleService: null,

	init: function () {
		this.preferenceService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.extendedart.");
		this.consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
	},

	showProgress: function (needShow) {
		var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

		document.getElementById("extendedart-progressMeter").hidden = !needShow;
		document.getElementById("extendedart-btns-hbox").hidden = needShow;
	},

	showCoversIframePane: function (needShow) {
		var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

		mainWindow.document.getElementById("extendedart-coversViewBox").hidden = !needShow;
		mainWindow.document.getElementById("sb_servicepane_box").hidden = needShow;
		//mainWindow.document.getElementById("servicepane_splitter").hidden = needShow;

		if (!needShow) {
			mainWindow.document.getElementById("displaypane_servicepane_bottom_splitter").setAttribute("state", "open");
			mainWindow.document.getElementById("extendedart-serviceIframe").contentDocument.location = "about:blank";
		}
		else {
			mainWindow.document.getElementById("displaypane_servicepane_bottom_splitter").setAttribute("state", "collapsed");
		}

		this.showProgress(false);
	},

	debugOutput: function (localOutStr) {

		//if (!this.preferenceService.getBoolPref("debugMode")) return;

		var localcurrentDate 	= new Date();
		var localMinutes 	= localcurrentDate.getMinutes();
		var localSeconds 	= localcurrentDate.getSeconds();
		var localMilliseconds 	= localcurrentDate.getMilliseconds();

		if (parseInt(localMinutes, 10) 	< 10) localMinutes 	= "0" + localMinutes;
		if (parseInt(localSeconds, 10) 	< 10) localSeconds 	= "0" + localSeconds;
		if (parseInt(localMilliseconds, 10) 	< 10) localMilliseconds = "0" + localMilliseconds;

		this.consoleService.logStringMessage("ExtendedArt [" + localMinutes + ":" + localSeconds + ":" + localMilliseconds + "] " + localOutStr);
	}
}

ExtendedArt.lib.init();

