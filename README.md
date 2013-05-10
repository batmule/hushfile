hushfile
========

hushfile is a file sharing service with clientside encryption. Idea and code by Thomas Steen Rasmussen / Tykling, 2013.

This code is released under 2-clause BSD license, so you are free to use this code to run your own hushfile service, modify the code, or whatever you like.

Theory of Operation
-------------------
The hushfile server is pretty simple, most of the hard work is done by the client. The server does the following:

    /upload
A POST to /upload uploads a new file to hushfile. The POST should contain the following fields to be valid:
- cryptofile (encrypted binary blob containing the actual file data)
- metadata (encrypted binary blob containing info on the file, filename, size, mime type, and the deletepassword.
- deletepassword (text field with the password used to delete the file from hushfile)

The server returns a json response with two fields, "status" and "fileid". If everything went well, status is "OK" and fileid contains the unique hushfile id assigned to this upload. If something goes wrong during upload, the status field contains a message explaining what went wrong. Clients can choose to show this info to the user if so desired.

After a successful upload, the server has three files saved: the encrypted file, the encrypted metadata, and a serverdata.json which is not encrypted, which contains the cleartext deletepassword in json format. The same password is present in the encrypted metadata, this makes it possible for the server to "authenticate" file deletions so only users with the correct file password can delete a given file.

    /about
This just shows the "About" page.

    /faq
This just shows the FAQ page

    /
A request for / shows the upload page.

    /fileid
Any other request is treated like a fileid. A request just for the fileid shows the download page.

    /fileid?metadata
This request downloads the encrypted metadata

    /fileid?filedata
This request downloads the encrypted file

    /fileid?delete&deletepassword=whatever
This request deletes the file from hushfile, given the correct deletepassword.


3rd Party Components
--------------------
The following components are used extensively in the code:
- http://code.google.com/p/crypto-js/
	Crypto-JS is used to perform encryption and decryption.

- http://twitter.github.io/bootstrap/
	Twitter Bootstrap is used for styling

- http://fortawesome.github.io/Font-Awesome/
	Font-Awesome is a great icon collection for use with Twitter Bootstrap