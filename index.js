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


/**
 * Create route /upload which handles the post request
 */
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


app.route('/download').post((req, res, next) => {
  console.log('inside download');
  const request = require('request');


  request('https://api-content.dropbox.com/1/files/auto/' + '/test.png', {
    auth: { bearer: 'l6iwj9af1i0bsr3' },
  }).pipe(fs.createWriteStream('files/test.png'));
  return false;
});


/**
 * Serve the basic index.html with upload form
 */
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
