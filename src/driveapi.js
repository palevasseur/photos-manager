
// Client ID and API key from the Developer Console
const CLIENT_ID = '936745005701-l2qrg6opbjvm37t51ljai2r1mqv3sbp0.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAvWabf39Kw5vwnTPyx-9e_ZCyOVLX7nnY';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
// https://developers.google.com/drive/v3/web/about-auth
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export function initGoogleDrive() {
  gapi.load('client:auth2', function() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(function(isSignedIn) {
        console.log(isSignedIn ? 'GDrive signed In' : 'GDrive signed OUT !');
      });

      // Handle the initial sign-in state.
      let signIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      if(!signIn) {
        console.log('GDrive logging...');
        driveSignin();
      }
    });
  });
}

export function driveSignin() {
  gapi.auth2.getAuthInstance().signIn();
}

export function driveSignout() {
  gapi.auth2.getAuthInstance().signOut();
}

// https://developers.google.com/drive/v3/reference/files?hl=fr
// "photos" folder = 16k3rwshhD23C4pWkYJa3OMCO2uBeUu09
export function getImagesList(folderId = '16k3rwshhD23C4pWkYJa3OMCO2uBeUu09') {
  return gapi.client.drive.files.list({
    q: "mimeType='image/jpeg' and '" + folderId + "' in parents",
    fields: 'files(id, name, size, webViewLink)'
  }).then(function(response) {
    let files = response.result.files;

    console.log('GDrive files for folder ' + folderId + ':');
    files.forEach(file => console.log(file.name + ' - id=' + file.id + ' - size=' + file.size + ' - link=' + file.webViewLink));

    return files;
  });
}

// return ArrayBuffer or base64
// note: getImage(fileId, true) return base64 and can be use in <img src={dataBase64}/>
export function getImage(fileId, base64 = false) {
  //var dest = fs.createWriteStream('/tmp/photo.jpg');
  return gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  }).then(function(res) {
    console.log('Get Image: ', res);
    let rawData = res.body;

    return base64 ? btoa(rawData) : str2ab(rawData);
  })
/*    .on('end', function () {
      console.log('Done');
    })
    .on('error', function (err) {
      console.log('Error during download', err);
    })
    .pipe(dest);*/
}

// string to ArrayBuffer
function str2ab(str) {
  let buf = new ArrayBuffer(str.length);
  let bufView = new Uint8Array(buf);
  for (let i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}