var download_progress = document.querySelector('.downloadpercent');

function download() {
	// hide the download button
	document.getElementById('download').style.display="none";
	// make download progress bar div visible
	document.getElementById('downloading').style.visibility="visible";
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/'+fileid+'?filedata', true);
	xhr.onload = function(e) {
		if (this.status == 200) {
			//done downloading, make downloading div green and change icon
			document.getElementById('downloading').style.color='green';
			document.getElementById('downloadingdone').className="icon-check";

			//make the decrypting div visible
			document.getElementById('decrypting').style.visibility="visible";

			// decrypt the data
			decryptedwords = CryptoJS.AES.decrypt(this.response, password);
			ui8a = CryptoJS.enc.u8array.stringify(decryptedwords);
			fileblob = new Blob([ui8a], { type: document.getElementById('mimetype').innerHTML });

			//done decrypting, change icon and make div green
			document.getElementById('decryptingdone').className="icon-check";
			document.getElementById('decrypting').style.color='green';

			// download prompt
			a = document.createElement("a");
			a.href = window.URL.createObjectURL(fileblob);
			a.download = document.getElementById('filename').innerHTML;
			linkText = document.createTextNode("Download");
			a.appendChild(linkText);
			a.className = "btn btn-success";
			document.getElementById('downloaddiv').appendChild(a);
			document.getElementById('downloaddiv').style.visibility="visible";
		} else {
			alert("An error was encountered downloading filedata.");
		};
	};
	
	// Listen to the download progress.
	xhr.onprogress = function(e) {
		if (e.lengthComputable) {
			temp = Math.round((e.loaded / e.total) * 100);
			download_progress.style.width = temp + '%';
			download_progress.textContent = temp + '%';
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
		try {
			var jsonmetadata = JSON.parse(metadata);
			document.getElementById('metadata').style.visibility="visible";
			document.getElementById('filename').innerHTML = jsonmetadata.filename;
			document.getElementById('mimetype').innerHTML = jsonmetadata.mimetype;
			document.getElementById('filesize').innerHTML = jsonmetadata.filesize;
		} catch(err) {
			alert("An error was encountered parsing metadata: " + err);
		};
	} else {
		alert("An error was encountered downloading metadata.");
	};
};

xhr.send();