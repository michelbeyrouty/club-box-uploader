const azure = require('azure-storage');
const CUSTOM = require('../custom');

const accountName = CUSTOM.AZURE.ACCOUNT_NAME;
const accessKey = CUSTOM.AZURE.ACCESS_KEY;
const blobService = azure.createBlobService(accountName, accessKey);

module.exports =  function uploadFilesToBlob (filesList) {
  filesList.map(uploadToBlob);

};


/**
 * uploadToBlob
 *
 * @param {json} fileDetails
 */
function uploadToBlob (fileDetails) {

  const blobName = fileDetails.filename;
  const filePath = './' + fileDetails.destination + fileDetails.filename;

  blobService.createBlockBlobFromLocalFile('clubox-inventory', blobName, filePath, (error, result, response) => {
    if (error) {
      console.log(error);
    }

    console.log(response.statusCode + ': uploaded ' + result.name + 'to clubox-inventory \n');
  });

}
