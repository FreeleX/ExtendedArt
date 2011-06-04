
// Make a namespace.
if (typeof ExtendedArt == 'undefined') {
  var ExtendedArt = {};
}

/**
 * UI controller that is loaded into the main player window
 */
ExtendedArt.Controller = {

	/**
	* Called when the window finishes loading
	*/
	onLoad: function() {
		
		// initialization code
		this._initialized = true;
		this._strings = document.getElementById("extendedart-strings");

		// Perform extra actions the first time the extension is run
		if (Application.prefs.get("extensions.extendedart.firstrun").value) {
			Application.prefs.setValue("extensions.extendedart.firstrun", false);
			this._firstRunSetup();
		}
		
		document.getElementById("nowSelectedMenu").addEventListener('popupshowing', this.onPopupShowing, false); 
	},


	/**
	* Called when the window is about to close
	*/
	onUnLoad: function() {
		
		this._initialized = false;
		
		document.getElementById("nowSelectedMenu").removeEventListener('popupshowing', this.onPopupShowing, false); 
	},



	/**
	* Perform extra setup the first time the extension is run
	*/
	_firstRunSetup : function() {

		// Call this.doHelloWorld() after a 3 second timeout
		setTimeout(function(controller) { controller.doHelloWorld(); }, 3000, this); 

	},

	/**
	* \brief Open new tab with google search, so user can drag pictures directly
	*/
	onGoogleSearch: function () {
		
		var mediaItem = null;
		if (AlbumArt._currentState == STATE_PLAYING) {
			mediaItem = AlbumArt.getNowPlayingItem();
		}
		else {
			if (AlbumArt._mediaListView)
				mediaItem = AlbumArt._mediaListView.selection.currentMediaItem;
		}

		if (!mediaItem) return;

		var metadataArtist = mediaItem.getProperty(SBProperties.artistName);
		var metadataAlbum = mediaItem.getProperty(SBProperties.albumName);

		if (!metadataArtist) metadataArtist = "";
		if (!metadataAlbum) metadataAlbum = "";

		var goUri = "http://www.google.com/search?&q=cover " + encodeURIComponent(metadataArtist) + "%20" + encodeURIComponent(metadataAlbum) + "&tbm=isch";
		this.openAndReuseOneTabPerAttribute("artwork-googlesearch", goUri);
		
	},

	/**
	* \brief Open new tab and reuse it later by attribute
	*/
	openAndReuseOneTabPerAttribute: function (attrName, url) {
		
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var tabbrowser = wm.getMostRecentWindow("Songbird:Main").gBrowser;

		var nsIURI = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI("http://www.google.com", null, null);

		for (var found = false, index = 0; index < tabbrowser.tabContainer.childNodes.length && !found; index++) {
			// Get the next tab
			var currentTab = tabbrowser.tabContainer.childNodes[index];

			// Does this tab contain our custom attribute?
			if (currentTab.hasAttribute(attrName)) {

			// Yes--select and focus it.
			tabbrowser.selectedTab = currentTab;

			// Focus *this* browser window in case another one is currently focused
			tabbrowser.ownerDocument.defaultView.focus();
			found = true;
			}
		}

		if (!found) {
			// Our tab isn't open. Open it now.

			// Create tab
			var newTab = tabbrowser.addTab(url, nsIURI);
			newTab.setAttribute(attrName, "xyz");

			// Focus tab
			tabbrowser.selectedTab = newTab;

			// Focus *this* browser window in case another one is currently focused
			tabbrowser.ownerDocument.defaultView.focus();
		}
		else {
			tabbrowser.getBrowserForTab(currentTab).loadURI(url, nsIURI);
		}
	},
  

	onDrop: function (event) {
		
		var url = event.dataTransfer.getData("text/x-moz-url");
		if (url.substr(0, 36) != "http://www.google.com/imgres?imgurl=") return;
		
		var aCallback = function (newFile) {
			if (newFile) {
				AlbumArt.setCurrentStateItemImage(newFile);
			}
			document.getElementById("extendedArtProgress").hidden = true;
		}
		
		var googleImgEndPos = url.indexOf("&", 36);
		if (googleImgEndPos != -1) {
			document.getElementById("extendedArtProgress").hidden = false;
			url = url.substring(36, googleImgEndPos);
			sbCoverHelper.downloadFile(url, aCallback)
			return;
		}
		
	},
	
	onPopupShowing: function () {
		document.getElementById("googleSearchArtworkMenuItem").hidden = (document.getElementById("getArtworkMenuItem").hidden || AlbumArt._currentState == STATE_SELECTED);
	}
};

window.addEventListener("load", function(e) { ExtendedArt.Controller.onLoad(e); }, false);
window.addEventListener("unload", function(e) { ExtendedArt.Controller.onUnLoad(e); }, false);
