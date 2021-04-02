const express = require('express');
const CUSTOM = require('./custom');
const { Dropbox } = require('dropbox');
const fs = require('fs-extra');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const dbx = new Dropbox({
  accessToken: CUSTOM.DROPBOX.ACCESS_TOKEN,
});

const uploadPath = path.join(__dirname, CUSTOM.FILE_LOCATION); // Register the upload path
fs.ensureDir(uploadPath); // Make sure that the upload path exits

// Initialize mutler
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CUSTOM.FILE_LOCATION);
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


// Private functions

async function downloadDirectoryContent (directoryPath = '') {

  const downloadedRessources = [];
  const directory =  await listDirectoryContent(directoryPath);

  for (ressource of directory) {

    if (ressource.type === 'folder') {
      await downloadDirectoryContent(ressource.path);
    }

    downloadDropBoxFile(ressource.path, ressource.name );
    downloadedRessources.push(ressource.name);
  }

  return downloadedRessources;
}

/**
 *  downloadDropBoxFile
 *
 * @param {strong} filePath
 * @param {strong} ressourceName
 *
 */
function downloadDropBoxFile (filePath, ressourceName) {

  const request = require('request');

  const options = {
    url:     CUSTOM.DROPBOX.DOWNLOAD_URL,
    method:  'POST',
    headers: {
      'Authorization':   `Bearer ${CUSTOM.DROPBOX.ACCESS_TOKEN}`,
      'Dropbox-API-Arg': JSON.stringify({ 'path': `${filePath}` }),
    },
  };

  request(options).pipe(fs.createWriteStream(`files/${ressourceName}`));
}


/**
 * listDirectoryContent
 *
 */
async function listDirectoryContent (directoryPath = '') {

  const response = await dbx.filesListFolder({
    path: directoryPath,
  });
  const dropboxDirectory = response.result.entries.map((entrie) => {
    return {
      path: entrie.path_lower,
      type: entrie['.tag'],
      name: entrie.name,
    };
  });

  return dropboxDirectory;
}


/**
 * extractMP3FromVideosListAndSave
 *
 * @param {array} filesList
 */
function extractMP3FromVideosListAndSave (filesList) {

  let isVideo = false;

  for (fileDetails of filesList) {
    isVideo = fileDetails.filename.endsWith(CUSTOM.CONVERSTION.MP4);

    if (isVideo) {
      extractMP3FromVideoAndSave(fileDetails.destination + '/' + fileDetails.filename);
    }
  }
}


/**
 * extractMP3FromVideoAndSave
 *
 * @param {string} videoPath
 */
function extractMP3FromVideoAndSave (videoPath) {

  const audioPath = videoPath.replace(CUSTOM.CONVERSTION.MP4, CUSTOM.CONVERSTION.MP3);

  new ffmpeg({ source: videoPath, nolog: true })
    .toFormat(CUSTOM.CONVERSTION.MP3)
    .on('end', () => {
      console.log('file has been converted successfully');
    })
    .on('error', (err) => {
      console.log('an error happened: ' + err.message);
    })
    .saveToFile(audioPath);
}
