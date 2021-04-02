const { Dropbox } = require('dropbox');
const CUSTOM = require('../custom');
const fs = require('fs-extra');

const dbx = new Dropbox({
  accessToken: CUSTOM.DROPBOX.ACCESS_TOKEN,
});

module.exports = async function downloadDirectoryContent (directoryPath = '') {

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
};


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
