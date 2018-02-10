import * as React from 'react';
import {Jimp} from './jimp';
import './App.css';
import {getImagesList as GDrive_getImagesList, getImage as GDrive_getImage} from './driveapi';
import {
  getImages as FireBase_getImages,
  Image as FireBase_Image,
  setBlurImage as FireBase_setBlurImage,
  writeImage as FireBase_writeImage
} from './firebase';
//const lennaUrl = require('./images/oeuf.jpg'); // this.createThumbnail(lennaUrl).then(image => image.getBase64(Jimp.MIME_JPEG, (err, src) => displayImage(src)));
//const IMAGE_URL = 'https://drive.google.com/uc?export=view&id='; // <img src={IMAGE_URL + img.id} height="200px"/>

const GDRIVE_PHOTOS_FOLDER_ID = '16k3rwshhD23C4pWkYJa3OMCO2uBeUu09';
const FIREBASE_THUMBS_FOLDER = 'thumbs/';

type GDriveImage = {
  name: string;
  id: string;
  size?: number;
  webViewLink?: string;
  state: 'loading' | 'creating thumb' | 'thumb saved' | 'error';
};

// https://github.com/oliver-moran/jimp
type JimpImage = {
  bitmap: {
    width: number;
    height: number;
    data: Uint8Array;
  },
  getBuffer: (mime: any, cb: any) => void;
  getBase64: (mime: any, cb: any) => void;
  resize: (width: number, height: number) => JimpImage; // resize the image. Jimp.AUTO can be passed as one of the values
  quality: (quality: number) => JimpImage; // set the quality of saved JPEG, 0 - 100
  blur: (r) => JimpImage; // fast blur the image by r pixels
  clone: () => JimpImage;
};

// CreateImagesPanel component
class CreateImagesPanel extends React.Component<{imagesList: GDriveImage[]}> {
  render() {
    let key = 0;
    return this.props.imagesList.map((img: GDriveImage) => (
      <div key={key++}>
        {img.name + ' (' + img.size + ')' + ': ' + img.state}
      </div>
    ));
  }
}

// ThumbList component
class ThumbsList extends React.Component<{images: FireBase_Image[]}> {
  render() {
    let key = 0;
    return this.props.images.map((img: FireBase_Image) => {
      return <img key={key++} src={img.thumb ? img.thumb.url : ''} />;
    });
  }
}

// ImageList component
class ImageList extends React.Component<{images: FireBase_Image[]}> {
  render() {
    let key = 0;
    return this.props.images.map((img: FireBase_Image) => {
      return <div key={key++}><img width={'100%'} src={img.blur ? img.blur.data : ''} /></div>;
    });
  }
}

type AppState = {
  GDImagesList: GDriveImage[],
  FBImagesList: FireBase_Image[],
  displayImage: boolean
};

class App extends React.Component {
  state: AppState = {
    GDImagesList: [],
    FBImagesList: [],
    displayImage: false
  };

  constructor(props) {
    super(props);

    this.createThumbs = this.createThumbs.bind(this);
    this.displayThumbs = this.displayThumbs.bind(this);
    this.onChangedisplayImages = this.onChangedisplayImages.bind(this);
  }

  onChangedisplayImages(e) {
    this.setState({displayImage: !this.state.displayImage});
  }

  render() {
    return (
      <div className="App">
        <h2>Google Drive photos</h2>
        <button onClick={this.createThumbs}>Create FireBase data</button><br/>
        <CreateImagesPanel imagesList={this.state.GDImagesList}/>
        <div>
          {this.allThumbsDone() ? <span>Thumbs creation terminated.</span> : <span/>}
        </div>
        <br/>
        <button onClick={this.displayThumbs}>Display</button>
        <input type="checkbox" onChange={this.onChangedisplayImages}/>Images
        <br/>
        {this.state.displayImage ? <ImageList images={this.state.FBImagesList}/> : <ThumbsList images={this.state.FBImagesList}/>}
      </div>
    );
  }

  private displayThumbs() {
    FireBase_getImages(FIREBASE_THUMBS_FOLDER).then( (imgs: FireBase_Image[]) => {
      const newList = {
        FBImagesList: imgs
      };
      this.setState(newList);
    });
  }

  private allThumbsDone() {
    if(!this.state.GDImagesList || this.state.GDImagesList.length === 0) {
      return false;
    }

    return this.state.GDImagesList.reduce((acc, cur) => (acc ? (cur.state === 'thumb saved' || cur.state === 'error') : false), true);
  }

  private setImageState(img: GDriveImage, state: GDriveImage['state']) {
    let newList = JSON.parse(JSON.stringify(this.state.GDImagesList));
    newList.some((i: GDriveImage) => {
      if(i.id === img.id) {
        i.state = state;
        return true;
      }

      return false;
    });

    this.setState({GDImagesList: newList});
  }

  private createThumbs() {
    GDrive_getImagesList(GDRIVE_PHOTOS_FOLDER_ID).then(list => {
      this.setState({GDImagesList: list});

      list.forEach((img:GDriveImage) => {
        this.setImageState(img, 'loading');
        GDrive_getImage(img.id)
          .then(abufData => {
            this.setImageState(img, 'creating thumb');
            this.createThumbnail(abufData).then((image: JimpImage) => {

              // save thumb
              image.getBuffer(Jimp.MIME_JPEG, (errt, srct) => {
                if(errt) {
                  this.setImageState(img, 'error');
                } else {
                  FireBase_writeImage(FIREBASE_THUMBS_FOLDER, img.name, srct).then(dbRef => {
                    this.setImageState(img, dbRef ? 'thumb saved' : 'error');

                    // create b64 blur
                    image.clone().resize(20, Jimp.AUTO).blur(5).quality(20).getBase64(Jimp.MIME_JPEG, (errb, srcb) => {
                      if(srcb) {
                        FireBase_setBlurImage(dbRef, srcb);
                      }
                    });
                  });
                }
              });

            });
          });
      });
    });
  }

  // data = url or arrayBuffer
  // return Jimp image
  private createThumbnail(data: string | ArrayBuffer, width = 100, quality = 60): Promise<JimpImage> {
    return new Promise(resolve => {
      Jimp.read(data).then((img: JimpImage) => {
        resolve(img.resize(width, Jimp.AUTO).quality(quality));
      }).catch(function (err) {
        console.log(err);
      });
    });
  }
}

// debug display
/*function displayImage(src) {
  const img = document.createElement('img');
  img.setAttribute('src', src);
  document.body.appendChild(img);
}*/

export default App;
