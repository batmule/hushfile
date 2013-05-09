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
	if(isset($_REQUEST['cryptofile']) && isset($_REQUEST['metadata']) && isset($_REQUEST['deletepassword'])) {
		// first get a new unique ID for this file
		$fileid = get_uniqid();
		$cryptofile = $datapath.$fileid."/cryptofile.dat";
		$metadatafile = $datapath.$fileid."/metadata.dat";
		$serverdatafile = $datapath.$fileid."/serverdata.json";
		
		// create folder for this file
		mkdir($datapath.$fileid);

		// write encrypted file
		$fh = fopen($cryptofile, 'w') or die(json_encode(array("status" => "unable to write cryptofile", "fileid" => "")));
		fwrite($fh, $_REQUEST['cryptofile']);
		fclose($fh);

		// write metadata file
		$fh = fopen($metadatafile, 'w') or die(json_encode(array("status" => "unable to write metadatafile", "fileid" => "")));
		fwrite($fh, $_REQUEST['metadata']);
		fclose($fh);

		// write serverdata file
		$fh = fopen($serverdatafile, 'w') or die(json_encode(array("status" => "unable to write serverdatafile", "fileid" => "")));
		$json = json_encode(array("deletepassword" => $_REQUEST['deletepassword']));
		fwrite($fh, $json);
		fclose($fh);

		// send email
		$to = "thomas@gibfest.dk";
		$subject = "new file uploaded to hushfile.it";
		$message = "new file uploaded to hushfile.it: http://hushfile.it/" . $fileid;
		$from = "upload@hushfile.it";
		$headers = "From:" . $from;
		mail($to,$subject,$message,$headers);
		
		// encode json reply
		echo json_encode(array("status" => "ok", "fileid" => $fileid));
	} else {
		header("Status: 400 Bad Request");
		die(json_encode(array("status" => "invalid upload request, missing file or metadata content or deletepassword, error", "fileid" => "")));
	}
} elseif($_SERVER["REQUEST_URI"] == "/about") {
	// show about page
	readfile("about.html");
} elseif($_SERVER["REQUEST_URI"] == "/faq") {
	// show FAQ
	readfile("faq.html");
} elseif($_SERVER["REQUEST_URI"] != "/") {
	// THIS IS A FILE DOWNLOAD
	if(strpos($_SERVER['REQUEST_URI'],"?") === false) {
		// THIS IS A DOWNLOAD REQUEST
		$fileid = substr($_SERVER['REQUEST_URI'],1);
		if (file_exists($datapath.$fileid)) {
			readfile("download.html");
		} else {
			header("Status: 404 Not Found");
			readfile("errorpages/invalidfileid.html");
		};
	} else {
		//get fileid
		$fileid = substr($_SERVER['REQUEST_URI'],1,strpos($_SERVER['REQUEST_URI'],"?"));
		//remove ? from fileid
		$fileid = substr($fileid,0,-1);
		//check if fileid is invalid
		if (!file_exists($datapath.$fileid)) {
			header("Status: 404 Not Found");
			readfile("errorpages/invalidfileid.html");
			die();
		};
		
		//get command
		$command = substr($_SERVER['REQUEST_URI'],strpos($_SERVER['REQUEST_URI'],"?")+1);
		if(strpos($command,"&") != false) {
			$command = substr($command,0,strpos($command,"&"));
		};

		switch($command) {
			case "metadata":
				//download metadata.dat file
				$file = $datapath.$fileid."/metadata.dat";
				header("Content-Length: " . filesize($file));
				readfile($file);
			break;
			case "filedata":
				//download cryptofile.dat file
				$file = $datapath.$fileid."/cryptofile.dat";
				header("Content-Length: " . filesize($file));
				$fp = fopen($file, "r");
				while (!feof($fp)) {
					echo fread($fp, 65536);
					flush(); // for large downloads
				} 
				fclose($fp);
			break;
			case "delete":
				//get deletepassword from $_GET
				$url = parse_url($_SERVER['REQUEST_URI']);
				$vars = explode("&",$url['query']);
				foreach($vars as $element) {
						if(strpos($element,"=") === false) {
								$key = $element;
						} else {
								$key = substr($element,0,strpos($element,"="));
								$value = substr($element,strpos($element,"=")+1);
						};
						if($key=="deletepassword") {
							$deletepass = $value;
						};
				};
				
				//get deletepassword from serverdata.json
				$file = $datapath.$fileid."/serverdata.json";
				$fh = fopen($file, 'r');
				$serverdata = fread($fh, filesize($file));
				fclose($fh);
				$serverdata = json_decode($serverdata,true);
				
				//check if passwords match
				if($deletepass == $serverdata['deletepassword']) {
					//password valid! delete stuff
					unlink($datapath.$fileid."/serverdata.json");
					unlink($datapath.$fileid."/metadata.dat");
					unlink($datapath.$fileid."/cryptofile.dat");
					rmdir($datapath.$fileid);
					readfile("pages/deleteok.html");
				} else {
					//incorrect password
					header("Status: 401 Unauthorized");
					readfile("errorpages/incorrectdeletepass.html");
				};
			break;
			default:
				// invalid command, show error page
				header("Status: 400 Bad Request");
				readfile("errorpages/invalidcommand.html");
			break;
		};
	};
} else {
	// THIS IS A NEW REQUEST, SHOW UPLOAD FORM
	readfile("upload.html");
}
?>
