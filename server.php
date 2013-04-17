<?php

$datapath = "/usr/local/www/filedata/"

function get_uniqid() {
	fileid = uniqid();
	if (file_exists($datapath.$fileid)) {
		//somehow this ID already exists, call recursively
		$fileid = get_uniqid();
	};
	return $fileid;
}


if(isset($_REQUEST['cryptofile']) && isset $_REQUEST['metadata']) {
	// first get a new unique ID for this file
	$fileid = get_uniqid();
	$cryptofile = $datapath.$fileid."cryptofile";
	$metadatafile = $datapath.$fileid."metadata";
	
	$fh = fopen($cryptofile, 'w') or die("can't open cryptofile");
	fwrite($fh, $_REQUEST['cryptofile']);
	fclose($fh);

	$fh = fopen($metadatafile, 'w') or die("can't open metadatafile");
	fwrite($fh, $_REQUEST['metadata']);
	fclose($fh);

	echo json_encode(array("status" => "ok", "fileid" => $fileid));
} else {
	echo json_encode(array("status" => "fail", "fileid" => ""));
}
?>
