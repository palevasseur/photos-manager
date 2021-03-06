import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyAeu_M2dYt369XsBOUN_3nBx_A0fe2cGjo',
  authDomain: 'photos-manager-c0a7f.firebaseapp.com',
  databaseURL: 'https://photos-manager-c0a7f.firebaseio.com',
  projectId: 'photos-manager-c0a7f',
  storageBucket: 'photos-manager-c0a7f.appspot.com',
  messagingSenderId: '936745005701'
};

export type Image = {
  fileName: string;
  thumb: {
    url: string;
  };
  blur?: {
    data: any;
  }
};

// todo: return Promise to provide error management: initFirebase().then(...).catch(...)
export function initFirebase() {
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

function createFileName(folder: string, fileName: string): string {
  return folder + fileName.replace('.', '_');
}

// dbRef: image db ref
export function setBlurImage(dbRef: firebase.database.Reference, data: any) : Promise<boolean> {
  const dbData : Image['blur'] = {
      data: data
  };
  return dbRef.child('blur').set(dbData).then( () => {
    console.log('Set blur image for ' + dbRef.key);
    return true;
  });
}

// return db ref of the new created image
export function writeImage(folder: string, fileName: string, data: any) : Promise<firebase.database.Reference> {
  const storageRef = firebase.storage().ref();
  const testRef = storageRef.child(folder + fileName);
  return testRef.put(data).then((snapshot: firebase.storage.UploadTaskSnapshot) => {
    if (snapshot.state === 'success') {
      const dbRef = firebase.database().ref().child(createFileName(folder, fileName));
      const dbData : Image = {
        fileName: fileName,
        thumb: {
          url: snapshot.metadata.downloadURLs[0]
        }
      };
      return dbRef.set(dbData).then( () => {
        console.log('Created new image ' + folder + fileName);
        return dbRef;
      });
    } else {
      console.log('Failed to create file ' + folder + fileName);
      return null;
    }
  });
}

// get metadata from fb storage
/*
    let storageRef = firebase.storage().ref();
    let folderRef = storageRef.child(folderName + fileName);
    folderRef.getMetadata().then( r => {
      let url = r.downloadURLs[0];
    });

 */

export function getImages(folderName: string) : Promise<Image[]> {
  const dbRef = firebase.database().ref().child(folderName);
  return dbRef.once('value').then(function(snapshot) {
    const imgs = snapshot.val();
    return Object.keys(imgs).map(imgKey => imgs[imgKey]);
  });
}