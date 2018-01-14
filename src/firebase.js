import * as firebase from 'firebase';

export function initFirebase() {
  let config = {
    apiKey: 'AIzaSyAeu_M2dYt369XsBOUN_3nBx_A0fe2cGjo',
    authDomain: 'photos-manager-c0a7f.firebaseapp.com',
    databaseURL: 'https://photos-manager-c0a7f.firebaseio.com',
    projectId: 'photos-manager-c0a7f',
    storageBucket: 'photos-manager-c0a7f.appspot.com',
    messagingSenderId: '936745005701'
  };

  firebase.initializeApp(config);

  let auth = firebase.auth();
  auth.onAuthStateChanged(function (state) {
    if(state) {
      console.log('logged', state);
      writeStorage('test.json', 'test ok');
    }
    else {
      console.log('logging...');
      auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  });
}

export function writeStorage(fileName, data) {
  let storageRef = firebase.storage().ref();
  let testRef = storageRef.child(fileName);
  testRef.putString(data).then(function(snapshot) {
    if (snapshot.state === 'success') {
      console.log('Created new backup ' + fileName);
    }
    else {
      console.log('Failed to create file !');
    }
  });
}