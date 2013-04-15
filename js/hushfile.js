var reader;
var load_progress = document.querySelector('.percent');
var encrypted;
var base64;

function randomPassword(length) {
	chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	pass = "";
	for(x=0;x<length;x++) {
		i = Math.floor(Math.random() * 62);
		pass += chars.charAt(i);
	}
	return pass;
}

function abortRead() {
	reader.abort();
}

function errorHandler(evt) {
	switch(evt.target.error.code) {
		case evt.target.error.NOT_FOUND_ERR:
			alert('File Not Found!');
		break;
		case evt.target.error.NOT_READABLE_ERR:
			alert('File is not readable');
		break;
		case evt.target.error.ABORT_ERR:
		break; // noop
		default:
			alert('An error occurred reading this file.');
	};
}

function updateProgress(evt) {
	// evt is an ProgressEvent.
	if (evt.lengthComputable) {
		var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		// Increase the load_progress bar length.
		if (percentLoaded < 100) {
			load_progress.style.width = percentLoaded + '%';
			load_progress.textContent = percentLoaded + '%';
		}
	}
}

function handleFileSelect(evt) {
	// Reset load_progress indicator on new file selection.
	load_progress.style.width = '0%';
	load_progress.textContent = '0%';
	document.getElementById('read_progress_div').style.visibility="visible";
	document.getElementById('encrypting').style.visibility="hidden";
	document.getElementById('encoding').style.visibility="hidden";
	
	reader = new FileReader();
	reader.onerror = errorHandler;
	reader.onprogress = updateProgress;

	reader.onabort = function(e) {
		alert('File read cancelled');
	};

	reader.onload = function(e) {
		// Ensure that the load_progress bar displays 100% at the end.
		load_progress.style.width = '100%';
		load_progress.textContent = '100%';
		//remove .active from the progress bar to stop animating it
		read_progress_bar.className= 'progress progress-striped';
		document.getElementById('readingdone').className= 'icon-check';
		document.getElementById('read_progress_div').style.color='green';
		
		//make the next section visible
		document.getElementById('encrypting').style.visibility="visible";
		document.getElementById('encryptingdone').className="icon-spinner icon-spin";
		setTimeout('encrypt()',1000);
	}

	// Read in the file as a binary string
	reader.readAsBinaryString(evt.target.files[0]);
}

function encrypt() {
	//encrypt the data
	encrypted = CryptoJS.AES.encrypt(reader.result, document.getElementById('password').value);
	document.getElementById('encryptingdone').className="icon-check";
	document.getElementById('encrypting').style.color='green';
	
	//make the next section visible
	document.getElementById('uploading').style.visibility="visible";
	document.getElementById('uploaddone').className="icon-spinner icon-spin";
	blob = new Blob([encrypted], {type: 'application/octet-stream'});
	setTimeout('upload(encrypted)',1000);
}

function upload(blob) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://hushfile.tyknet.dk/index.php', true);
	xhr.onload = function(e) {
		document.getElementById('uploaddone').className= "icon-check";
		document.getElementById('uploading').style.color='green';
		alert("upload finished!");
	};

	// Listen to the upload progress.
	var progressBar = document.querySelector('progress');
	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			progressBar.value = (e.loaded / e.total) * 100;
			progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
			console.log("upload progress: " + progressBar.value);
		}
	};
	xhr.send(blob);
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
	document.getElementById('files').disabled=true;
	document.getElementById('cancelbutton').disabled=true;
}

// create random password
document.getElementById('password').value=randomPassword(40);

//wait for a file to be selected
document.getElementById('files').addEventListener('change', handleFileSelect, false);
