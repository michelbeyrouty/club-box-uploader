const express = require('express');
const CUSTOM = require('./custom');
const fs = require('fs-extra');
const path = require('path');
const downloadDirectoryContent = require('./helpers/download-dropbox-root-directory');
const extractMP3FromVideosListAndSave = require('./helpers/extract-mp3-from-video-list-and-save');
const upload = require('./helpers/initialize-mutler')();

const uploadPath = path.join(__dirname, CUSTOM.FILE_LOCATION); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that the upload path exits


const app = express();


// Upload multiple files
app.post('/bulk', upload.array('profiles', 4), (req, res, next) => {
  try {

    extractMP3FromVideosListAndSave(req.files);

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
  return res.end();
});


const server = app.listen(3000, () => {
  console.log(`Listening on port ${server.address().port}`);
});
