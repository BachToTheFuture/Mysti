import React from 'react';
import styles from './styles.sass';
import WebFont from 'webfontloader';

import DirectoryItem from './DirectoryItem';

var mystiColors = [
  "rgba(96, 175, 255, 0.3)", "rgba(40, 194, 255, 0.3)", "rgba(76, 224, 179, 0.3)"
]

WebFont.load({
  google: {
    families: ['Raleway:500,700,800', 'sans-serif']
  }
});

const { ipcRenderer } = window.require('electron');

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      dirs: [{dir: "Global", filters: [{dir: "Desktop", filter: "[.pdf|.csv]"}]}]
    };
  }

  componentDidMount() {
    ipcRenderer.on('INITIALIZE_FILTERS', (event, filters) => {
      console.log(filters);
      filters = filters || [{dir: "Global", filters: [{dir: "Desktop", filter: "[.pdf|.csv]"}]}];
      this.setState({dirs: filters});
    });
  }
  
  sendFiltersUpdate = (data) => {
    ipcRenderer.send('FILTERS_UPDATED', data);
  }

  updateDir = (dir, filters, idx) => {
    let dirs = [...this.state.dirs];
    dirs[idx].dir = dir;
    dirs[idx].filters = filters;
    this.setState({
      dirs: dirs
    });
    console.log(this.state.dirs);
    this.sendFiltersUpdate(this.state.dirs);
  }

  addDir = () => {
    console.log(this.state.dirs)
    this.setState({
      dirs: this.state.dirs.concat([{new: true, dir: "", filters: []}])
    });
  }
  /*
  increase = () => {
    this.setState(prevState => (
      { counter: prevState.counter + 1 }
    ), () => {
      this.sendCounterUpdate(this.state.counter);
    });
    }

    decrease = () => {
    const { counter } = this.state;
    if (counter) {
      this.setState(prevState => (
        { counter: prevState.counter - 1 }
      ), () => {
        this.sendCounterUpdate(this.state.counter);
      });
    }
  }
  */
  /*
  <button
          type="button"
          className={styles.button}
          onClick={this.decrease}
        >
  */
  render() {
    const { counter } = this.state;
    let dirItems = [];
    
    for (var i = 0; i < this.state.dirs.length; i++) {
      // If it is new then enable edit mode
      if (this.state.dirs[i].new) {
        delete this.state.dirs[i].new;
        dirItems.push(<DirectoryItem updateDir={this.updateDir} idx={i} key={i} edit={true} dir={this.state.dirs[i].dir} filters={this.state.dirs[i].filters}/>);
      }
      else {
        dirItems.push(<DirectoryItem updateDir={this.updateDir} idx={i} key={i} dir={this.state.dirs[i].dir} filters={this.state.dirs[i].filters}/>);
      }
    }
    return (
      <div className={styles.app}>
        <img width="100" src={require('../../assets/mystiLogoSmall.png')} />
        <br></br>
        <span className={styles.title}>Filters</span><span className={styles.inputGroup}>
          <button onClick={this.addDir} className={styles.add}>Add directory</button>
          <button className={styles.edit}>Edit directories</button>
        </span>
        <p> Put some description blah blah blah here.</p>
        {dirItems}
      </div>
    );
  }
}
export default App;