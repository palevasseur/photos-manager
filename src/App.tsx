import * as React from 'react';
import './App.css';
import { getImagesList, getImage } from './driveapi';
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

  private listFiles() {
    getImagesList().then(list => {
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
    this.createThumbnail(lennaUrl)
      .then(image => image.getBase64(Jimp.MIME_JPEG, (err, src) => displayImage(src)));
  }

  private convertFromGDrive() {
    getImage('1lQ_68mExOcfIh0DEJDLOIM22yJuz0M9M') // oeuf.jpg
      .then(abufData => {
        this.createThumbnail(abufData).then(image => {
          // display thumb
          image.getBase64(Jimp.MIME_JPEG, (err, src) => displayImage(src));

          // save thumb
          image.getBuffer(Jimp.MIME_JPEG, (err, src) => writeData('thumbs/oeuf_thumb.jpg', src));
        });
      });
  }

  // data = url or arrayBuffer
  // return Jimp image
  private createThumbnail(data): Promise<any> {
    return new Promise(resolve => {
      Jimp.read(data).then(lenna => {
        const width = 100;
        const height = width*lenna.bitmap.height/lenna.bitmap.width;
        resolve(lenna.resize(width, height).quality(60));
      }).catch(function (err) {
        console.log(err);
      });
    });
  }
}

function displayImage(src) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  document.body.appendChild(img);
}

export default App;
