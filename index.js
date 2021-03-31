const express = require('express');         // Express Web Server
const busboy = require('connect-busboy');   // Middleware to handle the file upload
const path = require('path');               // Used for manipulation with path
const fs = require('fs-extra');             // Classic fs

const app = express();

// Insert the busboy middle-ware
app.use(busboy({
  highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
}));

const uploadPath = path.join(__dirname, 'files/'); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that the upload path exits

// upload handler
app.route('/upload').post((req, res, next) => {

  req.pipe(req.busboy); // Pipe it trough busboy

  req.busboy.on('file', (fieldname, file, filename) => {
    console.log(`Upload of '${filename}' started`);

    // Create a write stream of the new file
    const fstream = fs.createWriteStream(path.join(uploadPath, filename));
    // Pipe it trough
    file.pipe(fstream);

    // On finish of the upload
    fstream.on('close', () => {
      console.log(`Upload of '${filename}' finished`);
      res.redirect('back');
    });
  });
});

// download handler
app.route('/download').post((req, res, next) => {
  console.log('inside download');

  const request = require('request');

  const headers = {
    'Authorization':   'Bearer 5C0XX-ba_sgAAAAAAAAAAYPnBFDgH6_9e9V_EzXItl2y-5ZB7bj8AhEiqVGjYi5x',
    'Dropbox-API-Arg': '{"path": "/test.png"}',
  };

  const options = {
    url:     'https://content.dropboxapi.com/2/files/download',
    method:  'POST',
    headers: headers,
  };

  request(options).pipe(fs.createWriteStream('files/test.png'));
  return false;
});


// basic html at root
app.route('/').get((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<div class="topnav">');
  res.write('<div id="logo">Club-Box-uploader</div>');
  res.write('</div>');
  res.write('<br></br>');
  res.write('<form action="upload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="fileToUpload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  res.write('<br></br>');
  res.write('<form action="download" method="post" enctype="multipart/form-data">');
  res.write('<input type="submit"> Download dropbox files </input>');
  res.write('</form>');
  return res.end();
});

const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`);
});


// Method 2 for downloading dropbox

// const dbx = new Dropbox({ accessToken: DROP_BOX_ACCESS_TOKEN });

// dbx.filesDownload({ path: '/test.png' })
//       .then((response)=>  {
//         console.log('File Downloaded!' + response );
//         const buffer = response.result.fileBinary.buffer;

//       })
//       .catch((error) => {
//         console.error(error);
//       });

