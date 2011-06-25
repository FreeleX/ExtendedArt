
// Make a namespace.
if (typeof ExtendedArt == 'undefined') {
  var ExtendedArt = {};
}

/**
 * UI controller that is loaded into the main player window
 */
ExtendedArt.Controller = {

	abortTimeout: 30000,

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

		var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);
		
		document.getElementById("nowSelectedMenu").addEventListener('popupshowing', this.onPopupShowing, false);

		var splitter = AlbumArt._displayPane._splitter;
		splitter.setAttribute("disabled", "false");
		splitter.addEventListener('dragover', function (event) {splitter.setAttribute("state", "open");}, false);

		AlbumArt.animateHeight 		= ExtendedArt.Controller.animateHeight;
		AlbumArt.onServicepaneResize 	= ExtendedArt.Controller.onServicepaneResize;
		AlbumArt.onServicepaneResize();
	},


	/**
	* Called when the window is about to close
	*/
	onUnLoad: function() {
		
		this._initialized = false;
		
		document.getElementById("nowSelectedMenu").removeEventListener('popupshowing', this.onPopupShowing, false);
	
		var splitter = AlbumArt._displayPane._splitter;
		splitter.removeEventListener('dragover', function (event) {splitter.setAttribute("state", "open");}, false);
	},



	/**
	* Perform extra setup the first time the extension is run
	*/
	_firstRunSetup : function() {

		// Call this.doHelloWorld() after a 3 second timeout
		setTimeout(function(controller) { controller.doHelloWorld(); }, 3000, this); 

	},

	onServicepaneResize: function AlbumArt_onServicepaneResize(e) {
		var imgEl;
		if (AlbumArt._currentState == STATE_PLAYING) {
			imgEl = AlbumArt._albumArtPlayingImage;
		} else {
			imgEl = AlbumArt._albumArtSelectedImage;
		}

		// Determine the new actual image dimensions
		var svgWidth = imgEl.width.baseVal.value;
		var svgHeight = parseInt(AlbumArt.imageDimensions.aspectRatio * svgWidth);
		if (Math.abs(svgHeight - AlbumArt._displayPane.height) > 10) {
			AlbumArt._animating = true;
			AlbumArt._finalAnimatedHeight = svgHeight;
			AlbumArt.animateHeight(AlbumArt._displayPane.height);
		} else {
			if (!AlbumArt._animating)
				AlbumArt._displayPane.height = svgHeight+22; // +22 correction
			else
				AlbumArt._finalAnimatedHeight = svgHeight;
		}
	},

	animateHeight: function AlbumArt_animateHeight(destHeight) {
		destHeight = parseInt(destHeight);
		AlbumArt._displayPane.height = destHeight;

		if (destHeight == AlbumArt._finalAnimatedHeight) {
			AlbumArt._animating = false;
		} else {
			var newHeight;
			var delta = Math.abs(AlbumArt._finalAnimatedHeight - destHeight) / 2;
			if (delta < 5)
				newHeight = AlbumArt._finalAnimatedHeight;
			else {
				if (AlbumArt._finalAnimatedHeight > destHeight)
				newHeight = destHeight + delta;
				else
				newHeight = destHeight - delta;
			}
			setTimeout(AlbumArt.animateHeight, 0, newHeight+11); // +11 correction
		}
	},

	switchState: function () {
		var newState = !AlbumArt._currentState;
		document.getElementById("switchStateBtn").checked = !newState;
		if (newState) {
			AlbumArt.switchState(STATE_PLAYING);
		}
		else {
			AlbumArt.switchState(STATE_SELECTED);
		}
	},

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

		var goUri = "http://images.google.com/search?tbm=isch&hl=en&source=hp&q='" + encodeURIComponent(metadataArtist) + "'%20'" + encodeURIComponent(metadataAlbum) + "'&btnG=Search+Images&gbv=1";
		//this.openAndReuseOneTabPerAttribute("artwork-googlesearch", goUri);

					/*var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequesto)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

					constrHTML = "<tr><td><a href='http://2.bp.blogspot.com/-DvHtB78b8tc/TbeaXeJbvLI/AAAAAAAAGRA/k4vN40ozlbw/s400/Leaves%252527%252BEyes%252B-%252BMelusine%252B%252528Front%252BCover%252529%252Bby%252BEneas.jpg' onclick='return false;'><img src='http://t1.gstatic.com/images?q=tbn:ANd9GcTg-KieI95qKX7jNwVRI3aCkSK1m96HC73g8Xl0z8O7vTFCLK93EyilGRI' /></a><br>400 &times; 396 - 38k&nbsp;-&nbsp;jpg<br><cite title=\"my-music-land.blogspot.com\">my-music-land.blogspot...</cite></td></tr><tr><td><a href='http://1.bp.blogspot.com/-gou9MFKn354/Ta0_rQL0DwI/AAAAAAAAAyY/lGbclm9y8uI/s1600/cover_melusine_rgb_b.jpg' onclick='return false;'><img src='http://t2.gstatic.com/images?q=tbn:ANd9GcRbMOgOAa0xnOOAPHSgrs95PtkCyWImCTR8dwHEVjAKLB7bqjI6PF4lvQ' /></a><br>450 &times; 446 - 58k&nbsp;-&nbsp;jpg<br><cite title=\"musicgo-go.blogspot.com\">musicgo-go.blogspot.com</cite></td></tr><tr><td><a href='http://2.bp.blogspot.com/-DvHtB78b8tc/TbeaXeJbvLI/AAAAAAAAGRA/k4vN40ozlbw/s1600/Leaves%252527%252BEyes%252B-%252BMelusine%252B%252528Front%252BCover%252529%252Bby%252BEneas.jpg' onclick='return false;'><img src='http://t3.gstatic.com/images?q=tbn:ANd9GcRXnycfPDAd8AD1N1vqiWPa-0DFdHquxA_cdOftSjOgqPBsg3jYDyYxtQ' /></a><br>450 &times; 446 - 40k&nbsp;-&nbsp;jpg<br><cite title=\"metal-epic.blogspot.com\">metal-epic.blogspot.com</cite></td></tr><tr><td><a href='http://www.leaveseyes.de/wp-content/uploads/2011/04/cover_melusine_rgb_s.jpg' onclick='return false;'><img src='http://t0.gstatic.com/images?q=tbn:ANd9GcQEky5VLSSqEg_st7SsOY26USSMbwlLnTR2Vg1THdx4WwMtwuGZPuBmvw' /></a><br>200 &times; 198 - 16k&nbsp;-&nbsp;jpg<br><cite title=\"leaveseyes.de\">leaveseyes.de</cite></td></tr><tr><td><a href='http://www.mclub.com.ua/images/alb/cover3266_168676.jpg' onclick='return false;'><img src='http://t1.gstatic.com/images?q=tbn:ANd9GcTa397ljEHPpwDDpoIf1pQ2T9NjNbdFeUqRMiASubZ51PEu_w2kyLkHRQ' /></a><br>200 &times; 200 - 36k&nbsp;-&nbsp;jpg<br><cite title=\"mclub.com.ua\">mclub.com.ua</cite></td></tr><tr><td><a href='http://batzbatz.com/uploads/posts/2011-04/1303164064_cover_melusine_rgb_b.jpg' onclick='return false;'><img src='http://t2.gstatic.com/images?q=tbn:ANd9GcSVAfdhon2RICInG4Ehb-5-UXDkzCxV9LR-QYDYsIozabbKjN4bn6SwUDI' /></a><br>400 &times; 396 - 42k&nbsp;-&nbsp;jpg<br><cite title=\"batzbatz.com\">batzbatz.com</cite></td></tr><tr><td><a href='http://cdn.hometheaterforum.com/9/99/993f3171_cover_melusine_rgb_b.jpg' onclick='return false;'><img src='http://t3.gstatic.com/images?q=tbn:ANd9GcQFalfmP-9trAIcYyCqetBqXQ5b_frjaKTpFg0hN9MUDXewYuBQR4-07g' /></a><br>450 &times; 446 - 48k&nbsp;-&nbsp;jpg<br><cite title=\"hometheaterforum.com\">hometheaterforum.com</cite></td></tr><tr><td><a href='http://static.rateyourmusic.com/album_images/3d14050d45f24db2e889c2af0b4780b6/3440644.jpg' onclick='return false;'><img src='http://t0.gstatic.com/images?q=tbn:ANd9GcQpAiLQPQxm_rvqfDRzJ_894QT8Qke7VWkkE-1QVIM9tyJnARWYqjvprXQ' /></a><br>300 &times; 297 - 42k&nbsp;-&nbsp;jpg<br><cite title=\"rateyourmusic.com\">rateyourmusic.com</cite></td></tr><tr><td><a href='http://www.musikfactory.org/wordpress/wp-content/uploads/2011/04/folder16.jpg' onclick='return false;'><img src='http://t1.gstatic.com/images?q=tbn:ANd9GcRKsybvoidg_fdrM5j5ctkvLB8xJGWb-8v34Crq4vRn57pBLjtDM_YXcdE' /></a><br>300 &times; 297 - 26k&nbsp;-&nbsp;jpg<br><cite title=\"musikfactory.org\">musikfactory.org</cite></td></tr><tr><td><a href='http://i685.photobucket.com/albums/vv219/Metaltim/Feb%25202011/cover_melusine_rgb_b.jpg' onclick='return false;'><img src='http://t2.gstatic.com/images?q=tbn:ANd9GcTL5w9PQKcQaeuIrGaWG_mThGgTiobouw7D1-rcvxXtdx6lglRbwRCboNg' /></a><br>360 &times; 357 - 28k&nbsp;-&nbsp;jpg<br><cite title=\"bravewords.com\">bravewords.com</cite></td></tr><tr><td><a href='http://neformalmusic.com/uploads/posts/2011-04/1303215277_leaves-eyes-melusine-ep-2011.jpg' onclick='return false;'><img src='http://t3.gstatic.com/images?q=tbn:ANd9GcRcGqZpyKXpvEoMT3WX8ukNYarjkbGhfshZb_Bt-OFQVpGTuRwLGeRXovE' /></a><br>400 &times; 400 - 40k&nbsp;-&nbsp;jpg<br><cite title=\"neformalmusic.com\">neformalmusic.com</cite></td></tr><tr><td><a href='http://mp3musicmatrix.com/wp-content/uploads/2011/05/wpid-Leaves_Eyes_2011_Melusine_EP_.jpg' onclick='return false;'><img src='http://t0.gstatic.com/images?q=tbn:ANd9GcRa-yi7vd_c5Xmf6p-YAkNrDWIyVlJ62RjJpYPLW6ErAG5v3f0WW6l6vV7EOg' /></a><br>500 &times; 500 - 51k&nbsp;-&nbsp;jpg<br><cite title=\"mp3musicmatrix.com\">mp3musicmatrix.com</cite></td></tr><tr><td><a href='http://2.bp.blogspot.com/-4YtYbFBelDI/Ta9q-u5SnKI/AAAAAAAAAfk/l6x_TFLfBkU/s320/cover.jpg' onclick='return false;'><img src='http://t1.gstatic.com/images?q=tbn:ANd9GcSK4p_njG7YKfJU5PsJF-zW5Vmu7_vAkK0FlvNYBo00JHMplDrqtpgQ4w' /></a><br>320 &times; 317 - 33k&nbsp;-&nbsp;jpg<br><cite title=\"fan-from-hell-666.blogspot.com\">fan-from-hell-666.blog...</cite></td></tr><tr><td><a href='http://www.tvcoast.com/images_C/discography/leaves'_eyes_melusine_-_ep.jpg' onclick='return false;'><img src='http://t2.gstatic.com/images?q=tbn:ANd9GcTEfXCS4L7Vi5aNoie4qsEHPqELzdgCNVphkaq5V24FsinbVpvBIpUa5X0' /></a><br>150 &times; 150 - 5k&nbsp;-&nbsp;jpg<br><cite title=\"tvcoast.com\">tvcoast.com</cite></td></tr><tr><td><a href='http://rapidsharemp3.com/_Cache/mp3-download/4/0/34622/front_cover/5.jpg' onclick='return false;'><img src='http://t3.gstatic.com/images?q=tbn:ANd9GcSzcVzcvOzhZBLhG-bZM_91-RkAl9omun_UR_9V8I0KX5OpXLACAndBkj4' /></a><br>200 &times; 198 - 38k&nbsp;-&nbsp;jpg<br><cite title=\"rapidsharemp3.com\">rapidsharemp3.com</cite></td></tr><tr><td><a href='http://img.mp3mixx.com/images/covers/18/189270/alb_3780273_big.jpg' onclick='return false;'><img src='http://t0.gstatic.com/images?q=tbn:ANd9GcRksvSry5P9_gN0sj8J7487DGssgLo-lTV-_kU7RBBPZhOQX8dpxrfRpzU' /></a><br>200 &times; 200 - 19k&nbsp;-&nbsp;jpg<br><cite title=\"mp3mixx.com\">mp3mixx.com</cite></td></tr><tr><td><a href='http://i1.ambrybox.com/190411/1303181041546.jpg' onclick='return false;'><img src='http://t1.gstatic.com/images?q=tbn:ANd9GcTGzDpG2TKQjPlfq2ZAuArq0V5i-g-hTbDp5wwMUEX0v5_3eEKgn9XbUIg' /></a><br>400 &times; 396 - 40k&nbsp;-&nbsp;jpg<br><cite title=\"studentsharez.com\">studentsharez.com</cite></td></tr><tr><td><a href='http://www.metalkingdom.net/album/cover/d23/42889_leaves_eyes_melusine.jpg' onclick='return false;'><img src='http://t2.gstatic.com/images?q=tbn:ANd9GcQttzfwS0QJAcwqs_JkT2gRcZ5ISTf4DahtIi83jd0196O5mDUVvNy5zpo' /></a><br>300 &times; 300 - 23k&nbsp;-&nbsp;jpg<br><cite title=\"metalkingdom.net\">metalkingdom.net</cite></td></tr><tr><td><a href='http://lulzimg.com/i18/07537ec2.png' onclick='return false;'><img src='http://t3.gstatic.com/images?q=tbn:ANd9GcQL_gcyHcZ60eUcQxiJLpSYlNOUKaWroqZ77Ww3Qb0iEHvPDQ0joTy-AMw' /></a><br>632 &times; 2256 - 11k&nbsp;-&nbsp;png<br><cite title=\"downeu.com\">downeu.com</cite></td></tr><tr><td><a href='http://www.irupload.ir/images/geci03qo5pyxwhaqfan.jpg' onclick='return false;'><img src='http://t0.gstatic.com/images?q=tbn:ANd9GcRz6Cbvv6hL3l7GRUNFmvs1TaZU5a0ouixmNDah_A_5WrkGBNPQpiDPiYE' /></a><br>450 &times; 490 - 119k&nbsp;-&nbsp;jpg<br><cite title=\"devils-shadow.com\">devils-shadow.com</cite></td></tr>";
					constrHTML = "<table>" + constrHTML + "</table>";
					ExtendedArt.lib.showCoversIframePane(true);
					mainWindow.document.getElementById("extendedart-serviceIframe").contentDocument.body.innerHTML = constrHTML;*/

		var req = new XMLHttpRequest();
		if (!req) return;
		
		ExtendedArt.lib.showProgress(true);
		ExtendedArt.lib.debugOutput("Fetch: " + goUri);

		req.open("GET", goUri, true);
		
		var abortTimeout = setTimeout(function () {req.abort(); ExtendedArt.lib.showProgress(false);}, ExtendedArt.Controller.abortTimeout);
		
		req.onreadystatechange = function() {
			
			if (this.readyState != 4) return;
			
			clearTimeout(abortTimeout);
			ExtendedArt.lib.showProgress(false);
			
			var respHTML = "";
			if (this.status == 200) {
				respHTML = this.responseText;

				var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

				var constrHTML = "";
				var partStart = 0;
				
				while (true) {
					partStart = respHTML.indexOf("\/imgres\?imgurl", partStart+1);
					if (partStart == -1) {
						break;
					}

					var partEnd = respHTML.indexOf("\"]", partStart);
					if (partEnd == -1) partEnd = respHTML.indexOf("</td>", partStart);
					var partHTML = respHTML.substring(partStart, partEnd);
					ExtendedArt.lib.debugOutput("partEnd: " + partEnd);

					var exprSmallImgStart = new RegExp('http\:\/\/.{2}\.gstatic\.com\/images.{1}q', "i");
					var smallImgUrlStart = partHTML.search(exprSmallImgStart);
					var smallImgUrlEnd = partHTML.indexOf("\"", smallImgUrlStart);
					var smallImgUrl = partHTML.substring(smallImgUrlStart, smallImgUrlEnd).replace(/\\x3d/, "=");
					ExtendedArt.lib.debugOutput("smallImgUrl: " + smallImgUrl);

					var siteNameHTMLStart = partHTML.indexOf("<cite");
					var siteNameHTMLEnd = partHTML.indexOf("</cite>", siteNameHTMLStart);
					var siteNameHTML = partHTML.substring(siteNameHTMLStart, siteNameHTMLEnd+7);
					ExtendedArt.lib.debugOutput("siteNameHTML: " + siteNameHTML);

					var imgSizeHTMLStart = partHTML.search(/<br>\d{1,} &times;/);
					var imgSizeHTMLEnd = partHTML.indexOf("<br>", imgSizeHTMLStart+4);
					var imgSizeHTML = partHTML.substring(imgSizeHTMLStart+4, imgSizeHTMLEnd);
					ExtendedArt.lib.debugOutput("imgSizeHTML: " + imgSizeHTML);

					var fullUrlStart = 15;
					var fullUrlEnd = partHTML.indexOf("&amp;");
					var fullUrl = partHTML.substring(fullUrlStart, fullUrlEnd);
					ExtendedArt.lib.debugOutput("fullUrl: " + fullUrl);
					
					if (smallImgUrl.substr(0, 4) == "http") {
						constrHTML += 	"<tr align='center'><td>" +
									"<a href='" + fullUrl + "' onclick='return false;'><img src='" + smallImgUrl + "' /></a><br>" + 
									imgSizeHTML + "<br>" + 
									siteNameHTML +
									"<hr>" + 
								"</td></tr>";
					}
				}

				if (constrHTML == "") {
					ExtendedArt.lib.showCoversIframePane(false);
				}
				else {
					constrHTML = "<table align='center'>" + constrHTML + "</table>";
					ExtendedArt.lib.showCoversIframePane(true);
					mainWindow.document.getElementById("extendedart-serviceIframe").contentDocument.body.innerHTML = constrHTML;
					var scrollWidth = mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.document.body.scrollWidth;
					var clientWidth = mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.document.body.clientWidth;
					mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.scrollTo((scrollWidth-clientWidth) / 2, 0);
				}
			}
			else {
				ExtendedArt.lib.showCoversIframePane(false);
			}
		}
		
		req.onerror = function () {clearTimeout(abortTimeout); ExtendedArt.lib.showProgress(false);};
		req.send(null);
	},

	onYahooSearch: function () {
		
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

		var goUri = "http://images.search.yahoo.com/search/images?p='" + encodeURIComponent(metadataArtist) + "'%20'" + encodeURIComponent(metadataAlbum) + "'&ei=utf-8&fr=sfp&js=0";

		var req = new XMLHttpRequest();
		if (!req) return;
		
		ExtendedArt.lib.showProgress(true);
		ExtendedArt.lib.debugOutput("Fetch: " + goUri);

		req.open("GET", goUri, true);
		
		var abortTimeout = setTimeout(function () {req.abort(); ExtendedArt.lib.showProgress(false);}, ExtendedArt.Controller.abortTimeout);
		
		req.onreadystatechange = function() {
			
			if (this.readyState != 4) return;
			
			clearTimeout(abortTimeout);
			ExtendedArt.lib.showProgress(false);
			
			var respHTML = "";
			if (this.status == 200) {
				respHTML = this.responseText;

				var mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

				var partStart = 0;
				var constrHTML = "";
				
				var oldPartStart = respHTML.indexOf("<ul id=yschimg>");
				if (oldPartStart != -1) {
					var oldPartEnd = respHTML.indexOf("</ul>", oldPartStart);
					respHTML = respHTML.substring(oldPartStart, oldPartEnd);
					
					while (true) {
						partStart = respHTML.indexOf("<li", partStart+1);
						if (partStart == -1) {
							break;
						}

						var partEnd = respHTML.indexOf("</li>", partStart);
						var partHTML = respHTML.substring(partStart, partEnd);
						ExtendedArt.lib.debugOutput("partEnd: " + partEnd);

						var exprSmallImgStart = new RegExp('http\:\/\/ts\.{1,3}\.mm\.bing\.net\/images\/thumbnail\.aspx.{1}q', "i");
						var smallImgUrlStart = partHTML.search(exprSmallImgStart);
						var smallImgUrlEnd = partHTML.indexOf("&", smallImgUrlStart);
						var smallImgUrl = partHTML.substring(smallImgUrlStart, smallImgUrlEnd);
						ExtendedArt.lib.debugOutput("smallImgUrl: " + smallImgUrl);

						var siteNameHTMLStart = partHTML.indexOf("<address>");
						var siteNameHTMLEnd = partHTML.indexOf("</address>", siteNameHTMLStart);
						var siteNameHTML = "<cite>" + partHTML.substring(siteNameHTMLStart+9, siteNameHTMLEnd) + "</cite>";
						ExtendedArt.lib.debugOutput("siteNameHTML: " + siteNameHTML);

						var imgSizeHTMLStart = partHTML.search(/<em>/);
						var imgSizeHTMLEnd = partHTML.indexOf("</em>", imgSizeHTMLStart+4);
						var imgSizeHTML = partHTML.substring(imgSizeHTMLStart+4, imgSizeHTMLEnd);
						ExtendedArt.lib.debugOutput("imgSizeHTML: " + imgSizeHTML);

						var fullUrlStart = partHTML.indexOf("imgurl=");
						var fullUrlEnd = partHTML.indexOf("%26rurl=");
						var fullUrl = partHTML.substring(fullUrlStart+7, fullUrlEnd).replace(/%252F/g, "/");
						ExtendedArt.lib.debugOutput("fullUrl: " + fullUrl);
					
						if (smallImgUrl.substr(0, 4) == "http") {
							constrHTML += 	"<tr align='center'><td>" +
										"<a href='" + fullUrl + "' onclick='return false;'><img src='" + smallImgUrl + "' /></a><br>" + 
										imgSizeHTML + "<br>" + 
										siteNameHTML +
										"<hr>" + 
									"</td></tr>";
						}
					}
				}
				
				if (constrHTML == "") {
					ExtendedArt.lib.showCoversIframePane(false);
				}
				else {
					constrHTML = "<table align='center'>" + constrHTML + "</table>";
					ExtendedArt.lib.showCoversIframePane(true);
					mainWindow.document.getElementById("extendedart-serviceIframe").contentDocument.body.innerHTML = constrHTML;
					var scrollWidth = mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.document.body.scrollWidth;
					var clientWidth = mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.document.body.clientWidth;
					mainWindow.document.getElementById("extendedart-serviceIframe").contentWindow.scrollTo((scrollWidth-clientWidth) / 2, 0);
				}
			}
			else {
				ExtendedArt.lib.showCoversIframePane(false);
			}
		}
		
		req.onerror = function () {clearTimeout(abortTimeout); ExtendedArt.lib.showProgress(false);};
		req.send(null);
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
		document.getElementById("googleSearchArtworkMenuItem").hidden = document.getElementById("getArtworkMenuItem").hidden;
	}
};

window.addEventListener("load", function(e) { ExtendedArt.Controller.onLoad(e); }, false);
window.addEventListener("unload", function(e) { ExtendedArt.Controller.onUnLoad(e); }, false);
