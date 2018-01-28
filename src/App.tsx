import * as React from 'react';
import './App.css';
import { driveSignin, driveSignout, listFiles, getFile } from './driveapi';
import { Jimp } from './jimp';
const lennaUrl = require('./images/oeuf.jpg');

const IMAGE_URL = 'https://drive.google.com/uc?export=view&id=';

class App extends React.Component {
  state = {
    imagesList: []
  };

  constructor(props) {
    super(props);

    this.listFiles = this.listFiles.bind(this);
    this.convertFromGDrive = this.convertFromGDrive.bind(this);
    this.convertFromUrl = this.convertFromUrl.bind(this);
  }

  render() {
    return (
      <div className="App">
        Google Drive images:<br/>
        <button onClick={this.signIn}>SignIn</button>
        <button onClick={this.signOut}>SignOut</button><br/>
        <button onClick={this.convertFromUrl}>Convert Oeuf.jpg (from local url)</button><br/>
        <button onClick={this.convertFromGDrive}>Convert Oeuf.jpg (from Google Drive ID)</button><br/>
        {/*<button>Convert Oeuf.jpg (from Google Drive ID) and save to photos-manager DB</button><br/>*/}
        <button onClick={this.listFiles}>Get drive List</button><br/>
        <span>{this.createList()}</span>
      </div>
    );
  }

  private signIn() {
    driveSignin();
  }

  private signOut() {
    driveSignout();
  }

  private listFiles() {
    listFiles().then(list => {
      this.setState({imagesList: list});
    });
  }

  private url(img) {
    return IMAGE_URL+img.id;
  }

  private createList() {
    let key = 0;
    return this.state.imagesList.map(img => (
      <div key={key++}>
        <img src={this.url(img)} height="200px"/>
      </div>
    ));
  }

  private convertFromUrl() {
    this.convertImage(lennaUrl)
      .then(src => displayImage(src));
  }

  private convertFromGDrive() {
    getFile('1lQ_68mExOcfIh0DEJDLOIM22yJuz0M9M') // oeuf.jpg
      .then( rawData => {
        /*const encodedResponse = btoa(rawData);
        const img = new Image();
        img.src = 'data:image/gif;base64,' + encodedResponse;
        img.onload = function() {
          document.body.appendChild(img);
        };*/

        this.convertImage(str2ab(rawData))
          .then(src => displayImage(src));
      });
  }

  // data = url or arrayBuffer
  private convertImage(data) : Promise<any> {
    return new Promise(resolve => {
      Jimp.read(data).then(lenna => {
        lenna.resize(256, 256)            // resize
          .quality(60)                 // set JPEG quality
          .greyscale()                 // set greyscale
          .getBase64(Jimp.MIME_JPEG, function (err, src) {
            resolve(src);
          });
      }).catch(function (err) {
        console.log(err);
      });
    });
  }

}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function displayImage(src) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  document.body.appendChild(img);
}

export default App;
