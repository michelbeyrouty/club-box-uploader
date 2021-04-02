const express = require('express');
const busboy  = require('connect-busboy');

const downloadDirectoryContent = require('./helpers/download-dropbox-root-directory');
const extractMP3FromVideosListAndSave = require('./helpers/extract-mp3-from-video-list-and-save');
const uploadToMVP = require('./helpers/initialize-mutler')();
const uploadFilesToBlob = require('./helpers/upload-to-azure-blob');
const azureStreamUpload = require('./helpers/azure-stream-upload');

const app = express();
app.use(busboy());

// Upload multiple files, Extract MP3 from video and upload to Azure
app.post('/bulk', uploadToMVP.array('profiles', 4), (req, res, next) => {
  try {
    console.log('upload done');

    extractMP3FromVideosListAndSave(req.files);
    uploadFilesToBlob(req.files);

    res.send(req.files);

  } catch (error) {

    console.log(error);
    res.send(400);
  }

});


// Download files from dropbox
app.post('/dropbox/download', async (req, res) => {
  try {

    const downloadedRessources = await downloadDirectoryContent();

    res.send('Files Downloaded \n \n' + downloadedRessources.map((fileName) => fileName + '\n'));

  } catch (error) {
    console.log(error);
    res.send(400);
  }
});

app.post('/streamUpload', (req, res, params) => {

  azureStreamUpload(req, res);

});


// Basic html at root
app.route('/').get((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<div class="topnav">');
  res.write('<div id="logo">Club-Box-uploader</div>');
  res.write('</div>');
  res.write('<br></br>');
  res.write('<form action="bulk" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="profiles" multiple><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  res.write('<br></br>');
  res.write('<form action="/dropbox/download" method="post" enctype="multipart/form-data">');
  res.write('<input type="submit"> Download dropbox files </input>');
  res.write('</form>');
  res.write('<br></br>');
  res.write('<form action="streamUpload" method="post" enctype="multipart/form-data">');
  res.write('<input type="file" name="profiles" multiple> azure stream </input><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  res.write('<br></br>');
  return res.end();
});


const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`);
});
