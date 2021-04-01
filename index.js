const express = require('express');
const CUSTOM = require('./custom');
const { Dropbox } = require('dropbox');
const fs = require('fs-extra');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
console.log(ffmpegInstaller.path, ffmpegInstaller.version);


const dbx = new Dropbox({
  accessToken: CUSTOM.DROPBOX.ACCESS_TOKEN,
});

const uploadPath = path.join(__dirname, CUSTOM.FILE_LOCATION); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that the upload path exits

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
app.post('/bulk', upload.array('profiles', 4), (req, res, next) => {
  try {

    let isVideo = false;

    for (fileDetails of req.files) {

      isVideo = fileDetails.filename.endsWith('mp4');

      if (isVideo) {
        extractMP3FromVideos(fileDetails.destination + '/' + fileDetails.filename);
      }

    }

    res.send(req.files);
  } catch (error) {
    console.log(error);
    res.send(400);
  }
});

// Download files from dropbox
app.post('/dropbox/download', async (req, res) => {
  try {
    const fileNamesList = await listDropboxContent();
    fileNamesList.map(downloadDropBoxFile);
    res.send('Files Downloaded \n \n' + fileNamesList.map((fileName) => fileName + '\n'));

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

// Private functions

/**
 *  downloadDropBoxFile
 *
 * @param {string} filename
 *
 */
function downloadDropBoxFile (filename) {

  const request = require('request');

  const options = {
    url:     CUSTOM.DROPBOX.DOWNLOAD_URL,
    method:  'POST',
    headers: {
      'Authorization':   `Bearer ${CUSTOM.DROPBOX.ACCESS_TOKEN}`,
      'Dropbox-API-Arg': JSON.stringify({ 'path': `${filename}` }),
    },
  };

  request(options).pipe(fs.createWriteStream(`files/${filename}`));
}


/**
 * listDropboxContent
 *
 */
async function listDropboxContent () {

  const response = await dbx.filesListFolder({
    path: '',
  });
  const fileNamesList = response.result.entries.map((entrie) => { return entrie.path_lower; });

  return fileNamesList;
}


/**
 * extractMP3FromVideos
 *
 * @param {string} videoPath
 */
function extractMP3FromVideos (videoPath) {

  const audioPath = videoPath.replace('mp4', 'mp3');

  new ffmpeg({ source: videoPath, nolog: true })
    .toFormat('mp3')
    .on('end', () => {
      console.log('file has been converted successfully');
    })
    .on('error', (err) => {
      console.log('an error happened: ' + err.message);
    })
    .saveToFile(audioPath);
}


// How faster ?
// node functions right ?
