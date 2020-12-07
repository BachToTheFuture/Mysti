
import React from 'react';
import styles from './styles.sass';
import WebFont from 'webfontloader';
const path = require('path');
import DirectoryItem from './DirectoryItem';
const { shell } = require('electron')

// Load the font that Mysti uses!
WebFont.load({
  google: {
    families: ['Raleway:500,700,800', 'sans-serif']
  }
});

// ipcRenderer will allow the client side to talk to the server side
// and send some instructions and data on what to do (like saving filters)
const { ipcRenderer } = window.require('electron');

// Array to keep track of logs.
// Logs empty themselves when Mysti quits.
let logs = [];

// The server notifies the client that a file has been moved.
// This will create a notification.
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
      dirs: [],
      page: -1,
      new: false
    };
  }

  componentDidMount() {
    ipcRenderer.on('INITIALIZE', (event, filters, newuser) => {
      // Initialize states of this app.
      this.setState({dirs: filters});
      // If this is the first time on Mysti, open up page 2, which is the About page.
      if (newuser) setTimeout(()=>{
          this.setState({page: 2, new: true});
        }, 1000);
      // Otherwise just show the filters page.
      // The about page will just say "About" instead of "Welcome to Mysti!"
      else setTimeout(()=>{
        this.setState({page: 0, new: false});
      }, 1000);
    });
  }

  sendFiltersUpdate = (data) => {
    // A function to save filters in the server side.
    ipcRenderer.send('FILTERS_UPDATED', data);
  }

  updateDir = (dir, filters, idx) => {
    /*
    This main component has an array of directories, along with all the filters in these directories.
    React gets a little annoying here because it won't detect a change in state unless
    I explicitely use this.setState, but this.setState only lets me change the entire state and not a specific
    index.
    So I make a copy and change the copy and set the state to this copy.
    Admittedly not the most memory efficient.
    */
    let dirs = [...this.state.dirs];
    dirs[idx].dir = dir;
    dirs[idx].filters = filters;
    this.setState({
      dirs: dirs
    });
    this.sendFiltersUpdate(this.state.dirs);
  }

  deleteDir = (idx) => {
    let dirs = [...this.state.dirs];
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
    this.setState({
      dirs: this.state.dirs.concat([{new: true, dir: "", filters: []}])
    });
  }
  
  render() {
    if (this.state.page == -1) {
      // Render loading screen
      return (
        <div className={styles.parent}>
          <div className={styles.child}>
            <div className={styles.ldsHeart}><div></div></div>
          </div>
        </div>
      )
    }
    else {
      let dirItems = []; // A list of directory items
      let content = "";  // This is the content of each page, excluding the navbar at the top.
      
      if (this.state.page == 0) {
        /*
        Filters page:
        Render all directories and filters included in these directories.
        */
        for (var i = 0; i < this.state.dirs.length; i++) {
          // If the directory was newly created, put it in edit mode.
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
                <button onClick={()=>{shell.openExternal('https://bachtothefuture.github.io/Mysti/manual.html');}} className={styles.edit}>Need help?</button>
              </span>
            </div>
            {dirItems}
          </div>
        );
      }
      else if (this.state.page == 1) {
        /*
        Logs page:
        render all logs and links to the actual directories
        */
        let logs_elem = [];
        let n = 0;
        for (let item of logs) {
          logs_elem.push(
          <div className={styles.directory}>
            <p className={styles.smallTitle} style={{paddingBottom: "0px", marginBottom: "0px"}}>{item.fname}</p>
            <p><b>Moved to</b> <a className={styles.highlight} href="#" onClick={()=>{shell.showItemInFolder(item.dest)}}>{item.dest}</a></p>
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
        /*
        About page:
        render Mysti description and two action buttons
        */
        let header = this.state.new ? "Welcome to Mysti!" : "About"
        content =  (
          <div>
            <div className={styles.group}>
              <span className={styles.title}>{header}</span>
            </div>
            <p> <b>Mysti</b> is very much like an email filter, but instead of emails, it organizes files on your computer!</p>
            <p> It was created by Bach Nguyen for his CS50 final project in Fall 2020.</p>
            <button style={{marginRight: "10px", background: "#98e2ff"}} onClick={()=>{shell.openExternal('https://bachtothefuture.github.io/Mysti/manual.html');}}>Click here to see the manual!</button>
            <button onClick={()=>{this.setState({page:0}); this.addDir();}}>Go create your first filter!</button>
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
}
export default App;