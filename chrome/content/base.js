
Components.utils.import("resource://app/jsmodules/sbCoverHelper.jsm");

// Make a namespace.
if (typeof ExtendedArt == 'undefined') {
  var ExtendedArt = {};
};

ExtendedArt.base = {
	onLoad: function () {
	},
	
	onUnLoad: function () {
	}
};

window.addEventListener("load",   function(e) { ExtendedArt.base.onLoad(); },   false);
window.addEventListener("unload", function(e) { ExtendedArt.base.onUnLoad(); }, false);
