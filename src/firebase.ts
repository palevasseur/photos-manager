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
      console.log('FireBase logged', state);
    } else {
      console.log('FireBase logging...');
      auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }
  });
}

//writeString('test.json', 'test ok');
/*export function writeString(fileName: string, data: string) {
  let storageRef = firebase.storage().ref();
  let testRef = storageRef.child(fileName);
  testRef.putString(data).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
    if (snapshot.state === 'success') {
      console.log('Created new file ' + fileName);
    } else {
      console.log('Failed to create file !');
    }
  });
}*/

export function writeData(folder: string, fileName: string, data: any) : Promise<boolean> {
  let storageRef = firebase.storage().ref();
  let testRef = storageRef.child(folder + fileName);
  return testRef.put(data).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
    if (snapshot.state === 'success') {
      let dbRef = firebase.database().ref().child(folder + fileName.replace('.', '_'));
      return dbRef.set({fileName: fileName}).then( () => {
        console.log('Created new file ' + folder + fileName);
        return true;
      });
    } else {
      console.log('Failed to create file ' + folder + fileName);
      return false;
    }
  });
}

export function getData(folderName: string) : Promise<string[]> {
  let dbRef = firebase.database().ref().child(folderName);
  return dbRef.once('value').then(function(snapshot) {
    var imgs = snapshot.val();
    return new Promise<string[]>( resolve => {
      let imgsKeys = Object.keys(imgs);
      let res: string[] = [];
      imgsKeys.forEach(imgDBId => {
        let storageRef = firebase.storage().ref();
        let folderRef = storageRef.child(folderName + imgs[imgDBId].fileName);
        folderRef.getMetadata().then( r => {
          res.push(r.downloadURLs[0]);
          if(res.length===imgsKeys.length) {
            resolve(res);
          }
        });
      });
    });
  });
}