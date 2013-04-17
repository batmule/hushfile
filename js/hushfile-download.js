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
	document.getElementById('files').disabled=true;
	document.getElementById('cancelbutton').disabled=true;
}

// find the fileid
fileid = window.location.pathname.substring(1);
password = window.location.hash.substring(1);
//alert("ready to download file with fileid " + fileid + " and password " + password);

// download and decrypt metadata
var xhr = new XMLHttpRequest();
xhr.open('GET', '/'+fileid, true);
xhr.responseType = 'blob';

xhr.onload = function(e) {
	if (this.status == 200) {
		var blob = new Blob([this.response], {type: 'application/binary'});
		// decrypt metadata
		metadata = CryptoJS.AES.decrypt(blob, password);
		alert(metadata);
	} else {
		alert("An error was encountered downloading metadata.");
	};
};

xhr.send();