const express = require('express');

// Initialize mutler
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const app = express();


// Upload multiple files
app.post('/bulk', upload.array('profiles', 4), (req, res) =>{
  try {
    res.send(req.files);
  } catch (error) {
    console.log(error);
    res.send(400);
  }
});


// Basic html at root
app.route('/').get((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<div class="topnav">');
  res.write('<div id="logo">Club-Box-uploader</div>');
  res.write('</div>');
  res.write('<br></br>');
  res.write('<form action="single" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="fileToUpload"><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  // res.write('<br></br>');
  // res.write('<form action="download" method="post" enctype="multipart/form-data">');
  // res.write('<input type="submit"> Download dropbox files </input>');
  // res.write('</form>');
  // res.write('<br></br>');
  // res.write('<form action="upload2" method="post" enctype="multipart/form-data">');
  // res.write('<input type="submit"> upload 2 </input>');
  // res.write('</form>');
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


// Insert middle-ware
// app.use(busboy({
//   highWaterMark: 2 * 1024 * 1024, // 2MiB buffer
// }));


// Upload handler
// app.route('/upload').post((req, res, next) => {

//   req.pipe(req.busboy); // Pipe it trough busboy

//   req.busboy.on('file', (fieldname, file, filename) => {
//     console.log(`Upload of '${filename}' started`);

//     // Create a write stream of the new file
//     const fstream = fs.createWriteStream(path.join(uploadPath, filename));

//     // Pipe it trough
//     file.pipe(fstream);

//     // On finish of the upload
//     fstream.on('close', () => {
//       console.log(`Upload of '${filename}' finished`);
//       res.redirect('back');
//     });
//   });
// });


// const uploadPath = path.join(__dirname, CUSTOM.FILE_LOCATION); // Register the upload path
// fs.ensureDir(uploadPath); // Make sure that the upload path exits


// app.route('/download').post((req, res, next) => {
//   const request = require('request');

//   const options = {
//     url:     CUSTOM.DROPBOX.DOWNLOAD_URL,
//     method:  'POST',
//     headers: {
//       'Authorization':   `Bearer ${CUSTOM.DROPBOX.TOKEN}`,
//       'Dropbox-API-Arg': '{"path": "/test.png"}',
//     },
//   };

//   request(options).pipe(fs.createWriteStream('files/test.png'));
//   return false;
// });
