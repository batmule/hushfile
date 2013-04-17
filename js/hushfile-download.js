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
fileid = window.location.pathname;

alert("ready to download file with fileid " + fileid);
