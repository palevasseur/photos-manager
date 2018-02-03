import * as React from 'react';
import './App.css';
import {getImagesList, getImage} from './driveapi';
import {Jimp} from './jimp';
import {getData, writeData} from './firebase';
//const lennaUrl = require('./images/oeuf.jpg'); // this.createThumbnail(lennaUrl).then(image => image.getBase64(Jimp.MIME_JPEG, (err, src) => displayImage(src)));
//const IMAGE_URL = 'https://drive.google.com/uc?export=view&id='; // <img src={IMAGE_URL + img.id} height="200px"/>

const GDRIVE_PHOTOS_FOLDER_ID = '16k3rwshhD23C4pWkYJa3OMCO2uBeUu09';
const CLOUD_DEST_THUMBS_FOLDER = 'thumbs/';

type Image = {
  name: string;
  id: string;
  size?: number;
  webViewLink?: string;
  state: 'loading' | 'creating thumb' | 'thumb saved' | 'error'
};

type Thumb = {
  url: string
};

type AppState = {
  imagesList: Image[],
  thumbsList: Thumb[]
};

// ImageList component
class ImagesList extends React.Component<{imagesList: Image[]}> {
  render() {
    let key = 0;
    return this.props.imagesList.map((img: Image) => (
      <div key={key++}>
        {img.name + ' (' + img.size + ')' + ': ' + img.state}
      </div>
    ));
  }
}

// ThumbList component
class ThumbsList extends React.Component<{thumbsList: Thumb[]}> {
  render() {
    let key = 0;
    return this.props.thumbsList.map((thumb: Thumb) => {
      return <img key={key++} src={thumb.url} />;
    });
  }
}

class App extends React.Component {
  state: AppState = {
    imagesList: [],
    thumbsList: []
  };

  constructor(props) {
    super(props);

    this.createThumbs = this.createThumbs.bind(this);
    this.displayThumbs = this.displayThumbs.bind(this);
  }

  render() {
    return (
      <div className="App">
        <h2>Google Drive photos</h2>
        <button onClick={this.createThumbs}>Create thumbs</button><br/>
        <ImagesList imagesList={this.state.imagesList}/>
        <div>
          {this.allThumbsDone() ? <span>Thumbs creation terminated.</span> : <span/>}
        </div>
        <br/>
        <button onClick={this.displayThumbs}>Display thumbs</button><br/>
        <ThumbsList thumbsList={this.state.thumbsList}/>
      </div>
    );
  }

  private displayThumbs() {
    getData(CLOUD_DEST_THUMBS_FOLDER).then( urls => {
      this.setState({thumbsList: urls.map(url => { return {url: url}; })});
    });
  }

  private allThumbsDone() {
    if(!this.state.imagesList || this.state.imagesList.length === 0) {
      return false;
    }

    return this.state.imagesList.reduce((acc, cur) => (acc ? (cur.state === 'thumb saved' || cur.state === 'error') : false), true);
  }

  private setImageState(img: Image, state: Image['state']) {
    let newList = JSON.parse(JSON.stringify(this.state.imagesList));
    newList.some((i: Image) => {
      if(i.id === img.id) {
        i.state = state;
        return true;
      }

      return false;
    });

    this.setState({imagesList: newList});
  }

  private createThumbs() {
    getImagesList(GDRIVE_PHOTOS_FOLDER_ID).then(list => {
      this.setState({imagesList: list});

      list.forEach((img:Image) => {
        this.setImageState(img, 'loading');
        getImage(img.id)
          .then(abufData => {
            this.setImageState(img, 'creating thumb');
            this.createThumbnail(abufData).then(image => {
              // display thumb
              //image.getBase64(Jimp.MIME_JPEG, (err, src) => displayImage(src));

              // save thumb
              image.getBuffer(Jimp.MIME_JPEG, (err, src) => {
                if(err) {
                  this.setImageState(img, 'error');
                } else {
                  writeData(CLOUD_DEST_THUMBS_FOLDER, img.name, src)
                    .then(st => (this.setImageState(img, st ? 'thumb saved' : 'error')));
                }
              });
            });
          });
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

/*function displayImage(src) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  document.body.appendChild(img);
}*/

export default App;
