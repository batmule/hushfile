var reader;
var load_progress = document.querySelector('.loadpercent');
var upload_progress = document.querySelector('.uploadpercent');
var encrypted;
var filename;
var mimetype;
var filesize;

function randomPassword(length) {
	chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	pass = "";
	for(x=0;x<length;x++) {
		i = Math.floor(Math.random() * 62);
		pass += chars.charAt(i);
	}
	return pass;
};

function abortRead() {
	reader.abort();
};

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
};

function updateProgress(evt) {
	// evt is an ProgressEvent.
	if (evt.lengthComputable) {
		var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		// Increase the load_progress bar length.
		if (percentLoaded < 100) {
			load_progress.style.width = percentLoaded + '%';
			load_progress.textContent = percentLoaded + '%';
		};
	};
};

function handleFileSelect(evt) {
	// Reset load_progress indicator on new file selection.
	load_progress.style.width = '0%';
	load_progress.textContent = '0%';
	document.getElementById('read_progress_div').style.visibility="visible";
	document.getElementById('encrypting').style.visibility="hidden";
	document.getElementById('uploading').style.visibility="hidden";
	
	//create filereader object
	reader = new FileReader();
	
	//register event handlers
	reader.onerror = errorHandler;
	reader.onprogress = updateProgress;

	// runs after file reading completes
	reader.onload = function(e) {
		// Ensure that the load_progress bar displays 100% at the end.
		load_progress.style.width = '100%';
		load_progress.textContent = '100%';
		document.getElementById('readingdone').className= 'icon-check';
		document.getElementById('read_progress_div').style.color='green';
		
		//make the next section visible
		document.getElementById('encrypting').style.visibility="visible";
		document.getElementById('encryptingdone').className="icon-spinner icon-spin";
		setTimeout('encrypt()',1000);
	};

	// get file info and show it to the user
	filename = evt.target.files[0].name;
	mimetype = evt.target.files[0].type;
	filesize = evt.target.files[0].size;
	document.getElementById('filename').innerHTML = filename;
	document.getElementById('mimetype').innerHTML = mimetype;
	document.getElementById('filesize').innerHTML = filesize;

	// begin reading the file
	reader.readAsArrayBuffer(evt.target.files[0]);
};

function encrypt() {
	//encrypt the data
	ui8a = new Uint8Array(reader.result);
	wordarray = CryptoJS.enc.u8array.parse(ui8a);
	cryptoobject = CryptoJS.AES.encrypt(wordarray, document.getElementById('password').value);

	//encrypt the metadata
	metadataobject = CryptoJS.AES.encrypt('{"filename": "'+filename+'", "mimetype": "'+mimetype+'", "filesize": "'+filesize+'"}', document.getElementById('password').value);

	//done encrypting
	document.getElementById('encryptingdone').className="icon-check";
	document.getElementById('encrypting').style.color='green';

	//make the next section visible
	document.getElementById('uploading').style.visibility="visible";
	document.getElementById('uploaddone').className="icon-spinner icon-spin";

	setTimeout('upload(cryptoobject,metadataobject)',1000);
}

function upload(cryptoobject,metadataobject) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/upload', true);
	xhr.onload = function(e) {
		//make sure progress is at 100%
		upload_progress.style.width = '100%';
		upload_progress.textContent = '100%';
		//parse json reply
		document.getElementById('debugdiv').innerHTML = '<h4>Debug response</h4><p>' + xhr.responseText;
		try {
			var responseobject = JSON.parse(xhr.responseText);
			if (responseobject.status=='ok') {
				document.getElementById('uploaddone').className= "icon-check";
				document.getElementById('uploading').style.color='green';
				//get current URL
				url = window.location.protocol + '://' + window.location.host + '/';
				document.getElementById('response').innerHTML = '<p><i class="icon-check"></i> <b><span style="color: green;">Success! Your URL is:</span></b><br> <a class="btn btn-success" href="/'+responseobject.fileid+'#'+document.getElementById('password').value+'">'+url+responseobject.fileid+'#'+document.getElementById('password').value+'</a>';
			} else {
				document.getElementById('response').innerHTML = 'Something went wrong. Sorry about that. <a href="/">Try again.</a>';
			}
		} catch(err) {
			document.getElementById('response').innerHTML = 'Something went wrong: ' + err;
		};
	};

	// Listen to the upload progress.
	var progressBar = document.querySelector('progress');
	xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
			temp = Math.round((e.loaded / e.total) * 100);
			upload_progress.style.width = temp + '%';
			upload_progress.textContent = temp + '%';
		};
	};
	var formData = new FormData();
	formData.append('cryptofile', cryptoobject);
	formData.append('metadata', metadataobject);
	xhr.send(formData);
};

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	// Great success! All the File APIs are supported.
} else {
	alert('The File APIs are not fully supported in this browser.');
	document.getElementById('files').disabled=true;
	document.getElementById('cancelbutton').disabled=true;
};

// check for cryptojs
if (typeof CryptoJS === 'undefined') {
	alert('CryptoJS not loaded for some reason');
	document.getElementById('files').disabled=true;
	document.getElementById('cancelbutton').disabled=true;
};

// create random password
document.getElementById('password').value=randomPassword(40);

//wait for a file to be selected
document.getElementById('files').addEventListener('change', handleFileSelect, false);
