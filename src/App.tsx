import * as React from 'react';
import './App.css';
import { driveSignin, driveSignout, listFiles } from './driveapi';
import { Jimp } from './jimp';

const IMAGE_URL = 'https://drive.google.com/uc?export=view&id=';

class App extends React.Component {
  state = {
    imagesList: []
  };

  constructor(props) {
    super(props);

    this.listFiles = this.listFiles.bind(this);
  }

  render() {
    return (
      <div className="App">
        Google Drive images:
        <br/>
        <button onClick={this.signIn}>SignIn</button>
        <button onClick={this.signOut}>SignOut</button>
        <br/>
        <button onClick={this.testJimp}>Test Jimp</button>
        <br/>
        <button onClick={this.listFiles}>Get List</button>
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

  private testJimp() {
    Jimp.read('./images/lenna.png').then(lenna => {
      lenna.resize(256, 256)            // resize
        .quality(60)                 // set JPEG quality
        .greyscale()                 // set greyscale
        .getBase64(Jimp.MIME_JPEG, function (err, src) {
          var img = document.createElement('img');
          img.setAttribute('src', src);
          document.body.appendChild(img);
        });
    }).catch(function (err) {
      console.log(err);
    });
  }
}

export default App;
