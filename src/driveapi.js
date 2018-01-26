
// Client ID and API key from the Developer Console
const CLIENT_ID = '936745005701-l2qrg6opbjvm37t51ljai2r1mqv3sbp0.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAvWabf39Kw5vwnTPyx-9e_ZCyOVLX7nnY';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

export function initGoogleDrive() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

function updateSigninStatus(isSignedIn) {
  console.log(isSignedIn ? 'Signed In Success' : 'Signed In FAILED !');
}

export function driveSignin() {
  gapi.auth2.getAuthInstance().signIn();
}

export function driveSignout() {
  gapi.auth2.getAuthInstance().signOut();
}

export function listFiles() {
  return gapi.client.drive.files.list({
    q: "mimeType='image/jpeg'",
    fields: 'nextPageToken, files(id, name, webViewLink)'
  }).then(function(response) {
    console.log('Files:');
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log(file.name + ' (' + file.id + ') - ' + file.webViewLink);
      }
    }

    return response.result.files;
  });
}