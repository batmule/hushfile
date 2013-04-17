function download() {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/'+fileid+'?filedata', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			alert("decrypting filedata...");
			filedata = CryptoJS.AES.decrypt(this.response, password).toString(CryptoJS.enc.Utf8);
			var fileblob = new Blob([filedata], { type: document.getElementById('mimetype').innerHTML });
			var a = document.createElement("a");
			a.href = window.URL.createObjectURL(fileblob);
			a.download = document.getElementById('filename').innerHTML;
			alert("clicking download link");
			a.click();
		} else {
			alert("An error was encountered downloading filedata.");
		};
	};
};

xhr.send();
}

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