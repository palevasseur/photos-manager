import * as React from 'react';
import './App.css';
import { driveSignin, driveSignout, listJPG, getFile } from './driveapi';
import { Jimp } from './jimp';
import {writeData} from './firebase';
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
        <button onClick={this.convertFromGDrive}>
          Convert Oeuf.jpg (from Google Drive ID), store thumb in Storage
        </button><br/>
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
    listJPG().then(list => {
      this.setState({imagesList: list});
    });
  }

  private createList(display: 'img' | 'text' = 'text') {
    let key = 0;
    return this.state.imagesList.map((img: any) => (
      <div key={key++}>
        {display === 'img'
          ? <img src={IMAGE_URL + img.id} height="200px"/>
          : img.name + ' (' + img.size + ')' + ': ' + img.id}
      </div>
    ));
  }

  private convertFromUrl() {
    this.thumbnailBase64(lennaUrl)
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

        this.thumbnailBase64(str2ab(rawData))
          .then(src => displayImage(src));

        this.thumbnailBuffer(str2ab(rawData))
          .then(data => writeData('oeuf_thumb.jpg', data));
      });
  }

  // data = url or arrayBuffer
  private thumbnailBase64(data): Promise<any> {
    return new Promise(resolve => {
      Jimp.read(data).then(lenna => {
        const width = 100;
        const height = width*lenna.bitmap.height/lenna.bitmap.width;
        lenna.resize(width, height)
          .quality(60)
          .getBase64(Jimp.MIME_JPEG, function (err, src) {
            resolve(src);
          });
      }).catch(function (err) {
        console.log(err);
      });
    });
  }

  // data = url or arrayBuffer
  private thumbnailBuffer(data): Promise<any> {
    return new Promise(resolve => {
      Jimp.read(data).then(lenna => {
        const width = 100;
        const height = width*lenna.bitmap.height/lenna.bitmap.width;
        lenna.resize(width, height)
          .quality(60)
          .getBuffer(Jimp.MIME_JPEG, function (err, src) {
            resolve(src);
          });
      }).catch(function (err) {
        console.log(err);
      });
    });
  }
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

function displayImage(src) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  document.body.appendChild(img);
}

export default App;
