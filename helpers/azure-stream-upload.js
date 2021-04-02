
const azure = require('azure-storage');
const CUSTOM = require('../custom');

const accountName = CUSTOM.AZURE.ACCOUNT_NAME;
const accessKey = CUSTOM.AZURE.ACCESS_KEY;

module.exports = function azureStreamUpload (req) {

  req.pipe(req.busboy);

  req.busboy.on('file', (fieldname, file, filename) => {
    var blobSvc = azure.createBlobService(accountName, accessKey);
    file.pipe(blobSvc.createWriteStreamToBlockBlob('clubox-inventory', filename, (error) => {
      if (!error) {
        console.log(filename + ' uploaded to azure');
      }
    }));
  });

};
