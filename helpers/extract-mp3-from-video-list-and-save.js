const CUSTOM = require('../custom');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = function extractMP3FromVideosListAndSave (filesList) {

  let isVideo = false;

  for (fileDetails of filesList) {
    isVideo = fileDetails.filename.endsWith(CUSTOM.CONVERSTION.MP4);

    if (isVideo) {
      extractMP3FromVideoAndSave(fileDetails.destination + '/' + fileDetails.filename);
    }
  }
};


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
        console.log(audioPath.split('//')[1] + '  created successfully \n');
      })
      .on('error', (err) => {
        console.log('an error happened: ' + err.message);
      })
      .saveToFile(audioPath);
}
