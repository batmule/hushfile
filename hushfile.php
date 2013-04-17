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

if($_SERVER["REQUEST_URI"] != "/") {
	// THIS IS A FILE DOWNLOAD
	$fileid = substr($_SERVER["REQUEST_URI"],1);
	if (file_exists($datapath.$fileid)) {
		echo "file ready to be downloaded";
	} else {
		echo "file not found, expired perhaps?";
	}
} elseif(isset($_REQUEST['cryptofile']) && isset($_REQUEST['metadata'])) {
	// THIS IS A FILE UPLOAD
	
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
	// THIS IS A NEW REQUEST, SHOW UPLOAD FORM
	readfile("client.html");
}
?>
