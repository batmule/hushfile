// from http://freebeer.smithii.com/www/_source.php?file=%2Fhome%2Fross%2Fpublic_html%2Ffreebeer%2Fwww%2Flib%2Fbin2hex.js
var _hex2bin = [
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, // 0-9
     0,10,11,12,13,14,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, // A-F
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0,10,11,12,13,14,15, 0, 0, 0, 0, 0, 0, 0, 0, 0, // a-f
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
// from http://freebeer.smithii.com/www/_source.php?file=%2Fhome%2Fross%2Fpublic_html%2Ffreebeer%2Fwww%2Flib%2Fbin2hex.js
function hex2bin(str) {
	var len = str.length;
	var rv = '';
	var i = 0;
	var c1;
	var c2;
	while (len > 1) {
		h1 = str.charAt(i++);
		c1 = h1.charCodeAt(0);
		h2 = str.charAt(i++);
		c2 = h2.charCodeAt(0);
		rv += String.fromCharCode((_hex2bin[c1] << 4) + _hex2bin[c2]);
		len -= 2;
	}
	return rv;
}

function download() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/'+fileid+'?filedata', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			alert("decrypting filedata...");
			hexfiledata = CryptoJS.AES.decrypt(this.response, password);
			filedata = hex2bin(hexfiledata);
			fileblob = new Blob([filedata], { type: document.getElementById('mimetype').innerHTML });
			
			// download prompt
			a = document.createElement("a");
			a.href = window.URL.createObjectURL(fileblob);
			a.download = document.getElementById('filename').innerHTML;
			alert("clicking download link");
			a.click();
		} else {
			alert("An error was encountered downloading filedata.");
		};
	};
	xhr.send();
};

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	// Great success! All the File APIs are supported.
} else {
	alert('The File APIs are not fully supported in this browser.');
	document.getElementById('files').disabled=true;
	document.getElementById('cancelbutton').disabled=true;
}

// check for cryptojs
if (typeof CryptoJS === 'undefined') {
	alert('CryptoJS not loaded for some reason');
}

// find the fileid and password
fileid = window.location.pathname.substring(1);
password = window.location.hash.substring(1);

// download and decrypt metadata
var xhr = new XMLHttpRequest();
xhr.open('GET', '/'+fileid+'?metadata', true);

xhr.onload = function(e) {
	if (this.status == 200) {
		// decrypt metadata
		metadata = CryptoJS.AES.decrypt(this.response, password).toString(CryptoJS.enc.Utf8);
		var jsonmetadata = JSON.parse(metadata);
		document.getElementById('filename').innerHTML = jsonmetadata.filename;
		document.getElementById('mimetype').innerHTML = jsonmetadata.mimetype;
		document.getElementById('filesize').innerHTML = jsonmetadata.filesize;
		document.getElementById('download').style.visibility="visible";
	} else {
		alert("An error was encountered downloading metadata.");
	};
};

xhr.send();