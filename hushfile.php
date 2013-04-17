<?php
$datapath = "/usr/local/www/filedata/";

function get_uniqid() {
	$fileid = uniqid();
	if (file_exists($datapath.$fileid)) {
		//somehow this ID already exists, call recursively
		$fileid = get_uniqid();
	};
	return $fileid;
}

if($_SERVER["REQUEST_URI"] == "/upload") {
	// THIS IS A FILE UPLOAD
	if(isset($_REQUEST['cryptofile']) && isset($_REQUEST['metadata'])) {
		// first get a new unique ID for this file
		$fileid = get_uniqid();
		$cryptofile = $datapath.$fileid."/cryptofile.dat";
		$metadatafile = $datapath.$fileid."/metadata.dat";
		
		// create folder for this file
		mkdir($datapath.$fileid);
		
		// write encrypted file
		$fh = fopen($cryptofile, 'w') or die(json_encode(array("status" => "unable to write cryptofile", "fileid" => "")));
		fwrite($fh, $_REQUEST['cryptofile']);
		fclose($fh);

		//write metadata file
		$fh = fopen($metadatafile, 'w') or die(json_encode(array("status" => "unable to write metadatafile", "fileid" => "")));
		fwrite($fh, $_REQUEST['metadata']);
		fclose($fh);

		// encode json reply
		echo json_encode(array("status" => "ok", "fileid" => $fileid));
	} else {
		die(json_encode(array("status" => "invalid request", "fileid" => "")));
	}
} elseif($_SERVER["REQUEST_URI"] != "/") {
	// THIS IS A FILE DOWNLOAD
	$fileid = substr($_SERVER['REQUEST_URI'],1,strpos($_SERVER['REQUEST_URI'],"?")-1);
	if(strpos($_SERVER['REQUEST_URI'],"?") === false) {
		// THIS IS A DOWNLOAD REQUEST
		if (file_exists($datapath.$fileid)) {
			readfile("download.html");
		} else {
			echo "fileid " . $fileid . " not found, expired perhaps?";
		};
	} else {
		//get command
		$command = substr($_SERVER['REQUEST_URI'],strpos($_SERVER['REQUEST_URI'],"?")+1);
		switch($command) {
			case "metadata":
				//download metadata.dat file
				readfile($datapath.$fileid."/metadata.dat");
			break;
			case "filedata":
				//download cryptofile.dat file
				readfile($datapath.$fileid."/cryptofile.dat");
			break;
			default:
				// invalid command, load regular download page
				if (file_exists($datapath.$fileid)) {
					readfile("download.html");
				} else {
					echo "fileid " . $fileid . " not found, expired perhaps?";
				};
			break;
		};
	}
} else {
	// THIS IS A NEW REQUEST, SHOW UPLOAD FORM
	readfile("upload.html");
}
?>
