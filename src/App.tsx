import * as React from 'react';
import './App.css';
import { driveSignin, driveSignout, listFiles } from './driveapi';

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
}

export default App;
