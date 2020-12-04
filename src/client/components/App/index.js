import React from 'react';
import styles from './styles.sass';
import WebFont from 'webfontloader';
const path = require('path');
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

let logs = [];

ipcRenderer.on('MOVED_SUCCESS', (event, data) => {
  logs.push(data);
  const myNotification = new Notification(`${data.fname}`, {
    body: `Moved to ${data.dest}`
  });
});

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      dirs: [{dir: "Global", filters: [{dir: "Desktop", filter: "[.pdf|.csv]"}]}],
      page: 0
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

  deleteDir = (idx) => {
    let dirs = [...this.state.dirs];
    console.log("INDEX", idx, dirs);
    dirs.splice(idx, 1)
    this.setState({
      dirs: dirs
    }, () => {
      this.sendFiltersUpdate(this.state.dirs);
    });
  }

  switchPage = (page) => {
    this.setState({
      page: page
    });
  }

  addDir = () => {
    console.log(this.state.dirs)
    this.setState({
      dirs: this.state.dirs.concat([{new: true, dir: "", filters: []}])
    });
  }
  
  render() {

    const { counter } = this.state;
    let dirItems = [];
    let content = "";
    if (this.state.page == 0) {
      for (var i = 0; i < this.state.dirs.length; i++) {
        // If it is new then enable edit mode
        if (this.state.dirs[i].new) {
          delete this.state.dirs[i].new;
          dirItems.push(<DirectoryItem deleteDir={this.deleteDir} updateDir={this.updateDir} idx={i} key={i} edit={true} dir={this.state.dirs[i].dir} filters={this.state.dirs[i].filters}/>);
        }
        else {
          dirItems.push(<DirectoryItem deleteDir={this.deleteDir} updateDir={this.updateDir} idx={i} key={i} dir={this.state.dirs[i].dir} filters={this.state.dirs[i].filters}/>);
        }
      }
      content = (
        <div>
          <div className={styles.group}>
            <span className={styles.title}>Filters</span><span className={styles.inputGroup}>
              <button onClick={this.addDir} className={styles.add}>Add directory</button>
              <button className={styles.edit}>Need help?</button>
            </span>
          </div>
          {dirItems}
        </div>
      );
    }
    else if (this.state.page == 1) {
      let logs_elem = [];
      let n = 0;
        for (let item of logs) {
          logs_elem.push(
          <div className={styles.directory}>
            <p className={styles.smallTitle} style={{paddingBottom: "0px", marginBottom: "0px"}}>{item.fname}</p>
            <p>Moved to <span className={styles.dirText}>{item.dest}</span></p>
          </div>
          );
          n++;
        }
      
      content =  (
        <div>
          <div>
            <span className={styles.title}>Logs</span>
            <p>Logs are automatically deleted when Mysti stops running.</p>
          </div>
          {logs_elem}
        </div>
      );
    }
    else if (this.state.page == 2) {
      content =  (
        <div>
          <div className={styles.group}>
            <span className={styles.title}>About</span>
          </div>
          <p> <b>Mysti</b> is very much like an email filter, but instead of emails, it organizes files on your computer! It was created by Bach Nguyen for his CS50 final project in 2020.</p>
        </div>
      );
    }
    return (
      <div className={styles.app}>
          <div className={styles.group}>
            <span className={styles.smallTitle}><img width="50" src={require('../../assets/mystiLogoSmall.png')} />Mysti</span>
            <span className={styles.small} onClick={() => this.setState({ page: 0})}><a href="#">Filters</a></span>
            <span className={styles.small} onClick={() => this.setState({ page: 1})}><a href="#">Logs</a></span>
            <span className={styles.small} onClick={() => this.setState({ page: 2})}><a href="#">About</a></span>
          </div>
          {content}
        </div>
    )
  }
}
export default App;