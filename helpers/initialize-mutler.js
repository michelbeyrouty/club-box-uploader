const multer = require('multer');
const CUSTOM = require('../custom');

module.exports = function () {

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, CUSTOM.FILE_LOCATION);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage });

  return upload;
};

