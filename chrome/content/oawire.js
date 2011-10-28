// init the script when the window finished loading
window.addEventListener("load", function() { OAWireXUL.init(); }, false);  

var OAWireXUL = {
	// Code in relation with the XUL
	
	aConsoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),

	// IP patterns based on: https://gist.github.com/1289635
	ipv4Pattern: "(^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}(:[0-9]{1,5})?$)",
	ipv6Pattern: 
			"(^"+
			"\\[?"+ // starting port bracket
			"("+
			"(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|"+ // ip v6 not abbreviated
			"(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|"+ // ip v6 with double colon in the end
			"(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|"+ // - ip addresses v6
			"(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|"+ // - with
			"(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|"+ // - double colon
			"(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|"+ // - in the middle
			"(([0-9A-Fa-f]{1,4}:){6} ((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3} (\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){1,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){1}:([0-9A-Fa-f]{1,4}:){0,4}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,2}:([0-9A-Fa-f]{1,4}:){0,3}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,3}:([0-9A-Fa-f]{1,4}:){0,2}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,4}:([0-9A-Fa-f]{1,4}:){1}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d) |(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|"+ // ip v6 with compatible to v4
			"(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|"+ // ip v6 with double colon at the begining
			"(([0-9A-Fa-f]{1,4}:){1,7}:)"+ // ip v6 without ending
			")"+
			"\\]?(:[0-9]{1,5})?"+ // ending port bracket + port number
			"$)",

	prefManager: null,
	strbundle: null,

	init: function(){
		// get path of executer from preferences
		
		//this.aConsoleService.logStringMessage("init");
		this.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		this.strbundle = document.getElementById("translations"); // translations
		var appcontent = document.getElementById("appcontent"); // browser
		if(appcontent) appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, true);
	},

	onPageLoad: function(aEvent){
		//OAWireXUL.aConsoleService.logStringMessage("onPageLoad");
		var doc = aEvent.originalTarget; // doc is document that triggered "onload" event  
		// do something with the loaded page. 
		OAWireDOM.insertButtons(doc);
	},

	launchOA: function(ip){
		// check is the IP is valid
		if(ip != undefined && !this.checkIP(ip)){
			// Should we inform the user that the addon tried to launch a suspicious string?
			//window.alert("Invalid ip: \n"+ip);
			return false;
		}

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
		if(ip != undefined) { // If the ip is set, add it to the argument list
			args.push("+connect", ip);
		}

		args = args.concat(additionalArgument.split(" "));
		process.run(false, args, args.length);
	},

	openServerBrowser: function(){
		gBrowser.selectedTab = gBrowser.addTab("http://dpmaster.deathmask.net/?game=openarena");
	},

	openPreferences: function(){
		window.open("chrome://oawire/content/options.xul", "preferences", "chrome, resizable, centerscreen");
	},

	/*
	openAbout: function(){
		// TODO: about page not working since Firefox 4
		var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
		var aboutDialog = openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome, centerscreen, modal", "urn:mozilla:item:oawire@openarena.ws", extensionManager.datasource);
	},
	*/

	filePicker: function(){
		// Filepicker for browsing the executable file on the preferences window
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
	},

	/*
	testIP: function(){
		// for testing the regex with different valid addresses
		var a_ip = new Array(
			"127.0.0.1", "127.0.0.1:80", "217.112.174.254:27960",
			"2001:cdba:0000:0000:0000:0000:3257:9652", "2001:cdba:0:0:0:0:3257:9652", "2001:cdba::3257:9652", "::1/128",
			"[2001:db8:85a3:8d3:1319:8a2e:370:7348]:80", "[2001:cdba::3257:9652]:27960"
		);
		for(var i in a_ip){
			this.aConsoleService.logStringMessage(a_ip[i]+" = "+this.checkIP(a_ip[i]));
		}
	},
	*/
	
	checkIP: function(s){
		// Check if the string is a valid IP with or without a port number
		var pv4 = new RegExp(this.ipv4Pattern);
		if(pv4.test(s)) return true;
		var pv6 = new RegExp(this.ipv6Pattern);
		if(pv6.test(s)) return true;
		
		return false;
	},

};

var OAWireDOM = {
	// Code in relation with the content DOM
	// TODO: can this be made browser independent?

	aConsoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	
	// IP patterns based on: https://gist.github.com/1289635
	// starting and ending condition removed (it is used for searching not validating)
	ipv4Pattern: "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}(:[0-9]{1,5})?)",
	ipv6Pattern: 
			"("+
			"\\[?"+ // starting port bracket
			"("+
			"(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|"+ // ip v6 not abbreviated
			"(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|"+ // ip v6 with double colon in the end
			"(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|"+ // - ip addresses v6
			"(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|"+ // - with
			"(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|"+ // - double colon
			"(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|"+ // - in the middle
			"(([0-9A-Fa-f]{1,4}:){6} ((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3} (\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){1,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){1}:([0-9A-Fa-f]{1,4}:){0,4}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,2}:([0-9A-Fa-f]{1,4}:){0,3}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,3}:([0-9A-Fa-f]{1,4}:){0,2}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(([0-9A-Fa-f]{1,4}:){0,4}:([0-9A-Fa-f]{1,4}:){1}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d) |(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|"+ // ip v6 with compatible to v4
			"([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|"+ // ip v6 with compatible to v4
			"(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|"+ // ip v6 with double colon at the begining
			"(([0-9A-Fa-f]{1,4}:){1,7}:)"+ // ip v6 without ending
			")"+
			"\\]?(:[0-9]{1,5})?"+ // ending port bracket + port number
			")",

	insertButtons: function(content){
		// look through the pages, and insert buttons where needed
		
		//this.aConsoleService.logStringMessage("insertButtons");

		var links = content.querySelectorAll("a");
		var site = "other";
		if(content.location.href.substring(0, 45) == "http://dpmaster.deathmask.net/?game=openarena"){
			site = "dpmaster";
		}
		//this.aConsoleService.logStringMessage("Number of a elements: "+links.length);
		for(var i=0; i<links.length; i++){
			var elm = links[i];
			var ip = null;
			if(site == "dpmaster"){
				// if we are on dpmaster
				if(elm.innerHTML != "show" && elm.innerHTML != "hide" && elm.href.substring(0, 10) != "javascript"){
					// this is a possible launcher link, get the IP address (if any)
					var pv4 = new RegExp(this.ipv4Pattern);
					ip = elm.href.match(pv4);
					if(ip === null){
						var pv6 = new RegExp(this.ipv6Pattern);
						ip = elm.href.match(pv4);
					}
					if(ip !== null){
						// if there is an ip address
						this.createButton(elm, ip[0]);
					}
				}
			}else{
				// if we are on something else check for oacon:// protocol links
				if(elm.href.substring(0, 8) == "oacon://"){
					// this is a possible launcher link, get the IP address (if any)
					var pv4 = new RegExp(this.ipv4Pattern);
					ip = elm.href.match(pv4);
					if(ip === null){
						var pv6 = new RegExp(this.ipv6Pattern);
						ip = elm.href.match(pv4);
					}
					if(ip !== null){
						// if there is an ip address
						this.createButton(elm, ip[0], true);
					}
				}
			}
		}
	},

	createButton: function(elm, ip, replace){
		var newE;
		if(!replace){
			// create a new XHTML element
			newE = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
			var newT = document.createTextNode("Play!");
			newE.appendChild(newT);
		}else{
			// reuse the old one
			newE = elm;
		}
		//this.aConsoleService.logStringMessage("Create button");
		// setting the attributes
		newE.setAttribute("href", "#");
		newE.setAttribute("rel", ip);
		newE.style.textDecoration = "none";
		newE.style.color = "#fff";
		newE.style.paddingRight = "20px";
		newE.style.paddingLeft = "2px";
		newE.style.cursor = "pointer";
		newE.style.border = "1px #ccc solid";
		newE.style.background = "#333 url(chrome://oawire/skin/oa_16.png) no-repeat right";

		// event listeners
		newE.addEventListener("click", function(e){
				OAWireXUL.launchOA(this.getAttribute("rel"));
				if (e.preventDefault) {
					e.preventDefault();
				}
		}, false);
		newE.addEventListener("mouseover", function(){
			this.style.background = "#666 url(chrome://oawire/skin/oa_16.png) no-repeat right";
		}, false);
		newE.addEventListener("mouseout", function(){
			this.style.background = "#333 url(chrome://oawire/skin/oa_16.png) no-repeat right";
		}, false);
		
		if(!replace){
			// if not replacing then append the new element after the original
			newE.style.marginLeft = "1em";
			elm.parentNode.insertBefore(newE, elm.nextSibling);
		}

		return false;
	}
};
