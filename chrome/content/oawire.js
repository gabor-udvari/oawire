// init the script when the window finished loading
window.addEventListener("load", function() { OAWire.init(); }, false);  

var OAWire = function(){
	return {
		init: function(){
			// get path of executer from preferences
			this.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			this.strbundle = document.getElementById("translations"); // translations
			var appcontent = document.getElementById("appcontent"); // browser
			if(appcontent) appcontent.addEventListener("DOMContentLoaded", OAWire.onPageLoad, true);
		},

		onPageLoad: function(aEvent){
			var doc = aEvent.originalTarget; // doc is document that triggered "onload" event  
			// do something with the loaded page.  
			insertButtons(doc);
		},

		launchOA: function(ip){
			var executable = this.prefManager.getComplexValue("extensions.oawire.oaexecpath", Components.interfaces.nsILocalFile);
			var additionalArgument = this.prefManager.getCharPref("extensions.oawire.oaaddargument");

			// create an nsILocalFile for the executable
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithFile(executable);

			// create an nsIProcess
			var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
			process.init(file);

			// Run the process.
			var args = [];
			if(typeof(ip) != "undefined") { // If the ip is set, add it to the argument list
				args.push("+connect", ip);
			}
			args = args.concat(additionalArgument.split(" "));
			process.run(false, args, args.length);
		},

		openServerBrowser: function(){
			gBrowser.selectedTab = gBrowser.addTab("http://dpmaster.deathmask.net/?game=openarena");
		},

		openPreferences: function(){
			// flags should contain "chrome"
			window.open("chrome://oawire/content/options.xul", "preferences", "chrome");
		},

		openAbout: function(){
			var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
			var aboutDialog = openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", "urn:mozilla:item:oawire@openarena.ws", extensionManager.datasource);
    	},

		filePicker: function(){
			var selectFile = this.strbundle.getString("selectFile");
			var anyFile = this.strbundle.getString("anyFile");

			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, selectFile, nsIFilePicker.modeOpen);
			fp.appendFilter(anyFile, "*");
			var res = fp.show();
			if (res == nsIFilePicker.returnOK){
				var thefile = fp.file;
				// --- do something with the file here ---
				var pref = document.getElementById("oa-exec-path");
				pref.value = thefile.path;
			}
		}
	};
}();

var insertButtons = function(content){
	// can be made cross browser?
	var links = content.getElementsByTagName("A");
	var site = "other";
	if(content.location.href.substring(0, 45) == "http://dpmaster.deathmask.net/?game=openarena"){
		site = "dpmaster";
	}
	for(i=0; i<links.length; i++){
		var elm = links[i];
		if(site == "dpmaster"){
			// if we are on dpmaster
			if(elm.innerHTML != "show" && elm.innerHTML != "hide" && elm.href.substring(0, 10) != "javascript"){
				if(elm.href.substring(0, 53) == "http://dpmaster.deathmask.net/?game=openarena&server="){
					// Firebug.Console.log(elm.href);
					createButton(elm, elm.href.substring(53));
				}
			}
		}else{
			// if we are on something else
			if(elm.href.substring(0, 5) == "oacon"){
				createButton(elm, elm.href.substring(8), true);
			}
		}
	}
}

var createButton = function(elm, ip, replace){
	// can be made cross browser?
	
	var newA;
	if(!replace){
		// create new element
		newA = document.createElement("a");
		var newT = document.createTextNode("Play!");
		newA.appendChild(newT);
		newA.style.marginLeft = "2em";
	}else{
		newA = elm;
	}
	// setting the attributes
	newA.setAttribute("href", "#");
	newA.setAttribute("rel", ip);
	newA.style.fontFamily = "Arial,sans-serif";
	newA.style.size = "12px";
	newA.style.textDecoration = "none";
	newA.style.color = "#fff";
	newA.style.paddingRight = "20px";
	newA.style.paddingLeft = "2px";
	newA.style.cursor = "pointer";
	newA.style.border = "1px #ccc solid";
	newA.style.background = "#333 url(chrome://oawire/skin/oa_16.png) no-repeat right";
	if(!replace){
		// append element in the right place
		elm.parentNode.insertBefore(newA, elm.nextSibling);
	}
	newA.addEventListener("click", function(){
		OAWire.launchOA(this.getAttribute("rel"));
	}, false);
	newA.addEventListener("mouseover", function(){
		this.style.background = "#666 url(chrome://oawire/skin/oa_16.png) no-repeat right";
	}, false);
	newA.addEventListener("mouseout", function(){
		this.style.background = "#333 url(chrome://oawire/skin/oa_16.png) no-repeat right";
	}, false);

	return false;
}
