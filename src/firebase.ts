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
  auth.onAuthStateChanged((state: firebase.User) => {
    if (state) {
      console.log('logged', state);
      //writeString('test.json', 'test ok'); // todo: remove test
    } else {
      console.log('logging...');
      auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  });
}

export function writeString(fileName: string, data: string) {
  let storageRef = firebase.storage().ref();
  let testRef = storageRef.child(fileName);
  testRef.putString(data).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
    if (snapshot.state === 'success') {
      console.log('Created new file ' + fileName);
    } else {
      console.log('Failed to create file !');
    }
  });
}

export function writeData(fileName: string, data: any) {
  let storageRef = firebase.storage().ref();
  let testRef = storageRef.child(fileName);
  testRef.put(data).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
    if (snapshot.state === 'success') {
      console.log('Created new file ' + fileName);
    } else {
      console.log('Failed to create file !');
    }
  });
}