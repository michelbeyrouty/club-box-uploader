const express = require('express');
const busboy = require('connect-busboy');
const path = require('path');
const fs = require('fs-extra');
const CUSTOM = require('./custom');

const app = express();

// Insert middle-ware
app.use(busboy({
  highWaterMark: 2 * 1024 * 1024, // 2MiB buffer
}));

const uploadPath = path.join(__dirname, CUSTOM.FILE_LOCATION); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that the upload path exits

// Handlers

// Upload handler
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


// Download handler
app.route('/download').post((req, res, next) => {
  const request = require('request');

  const options = {
    url:     CUSTOM.DROPBOX.DOWNLOAD_URL,
    method:  'POST',
    headers: {
      'Authorization':   `Bearer ${CUSTOM.DROPBOX.TOKEN}`,
      'Dropbox-API-Arg': '{"path": "/test.png"}',
    },
  };

  request(options).pipe(fs.createWriteStream('files/test.png'));
  return false;
});


// Basic html at root
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

