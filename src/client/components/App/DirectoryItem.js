import React from 'react';
import styles from './styles.sass';
import FilterItem from './FilterItem';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

const { ipcRenderer } = window.require('electron');
const path = require('path');
const {dialog, getCurrentWindow} = require('electron').remote;
class DirectoryItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: props.edit || false,
      dir: props.dir || "",
      filters: props.filters || []
    };
  }
  
  componentWillReceiveProps(props) {
    this.setState({
      dir: props.dir,
      filters: props.filters,
    })
  }

  addFilter = () => {
    this.setState({
      filters: this.state.filters.concat([{new: true, filter: "", dir: ""}])
    });
  }
  setDir = (dir) => {
    this.setState({ dir: dir });
  }
  toggleEdit = () => {
    this.setState({
        edit: true
    });
  }

  getDir = () => {
    dialog.showOpenDialog( getCurrentWindow(), {
      properties: ['openDirectory']
    }).then(result => {
        let path = result.filePaths;
        console.log(path);
        if(path.length){
          this.setState({
              dir: path[0]
          });
        }else {
            console.log("No path selected");
        }});
  }

  delete = () => {
    this.props.deleteDir(this.props.idx)
  }

  deleteFilter = (idx) => {
    let filters = [...this.state.filters];
    filters.splice(idx, 1)
    this.setState({
      filters: filters
    }, () => {
      this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);
    });
  }

  updateFilter = (filter, dir, idx) => {
    let filters = [...this.state.filters];
    filters[idx].filter = filter;
    filters[idx].dir = dir;
    this.setState({
      filters: filters
    });
  }
  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
        this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);
    }
  }
  updateDirDirect = () => {
    this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);
  }

  render() {
      let filterItems = [];
      for (var i = 0; i < this.state.filters.length; i++) {
        if (this.state.filters[i].new) {
          delete this.state.filters[i].new;
          filterItems.push(<FilterItem deleteFilter={this.deleteFilter} updateDir={this.updateDirDirect} updateFilter={this.updateFilter} key={i} idx={i} edit={true} filter={this.state.filters[i].filter} dir={this.state.filters[i].dir}/>);
        }
        else filterItems.push(<FilterItem deleteFilter={this.deleteFilter} updateDir={this.updateDirDirect} updateFilter={this.updateFilter} idx={i} key={i} filter={this.state.filters[i].filter} dir={this.state.filters[i].dir}/>);
      }
      /*
      if (filterItems.length == 0) {
        filterItems = (
          <div>
            <b>Hello</b>
          </div>
        )
      }
      */
      let header = this.state.edit ? (
        <div className={styles.filterEdit}>
            <span style={{paddingTop: "20px"}} className={styles.helperText}>Where should Mysti look for new files?</span>
            <input className={styles.dirInput} value={this.state.dir} onChange={event => this.setDir(event.target.value)} type="text" onKeyPress={this.handleKeyPress} placeholder="Directory..." name="directory"></input>
            <div style={{padding:"2px"}}></div>
            <span className={styles.inputGroupSmall}>
              <button onClick={this.getDir} className={styles.add}>Folder</button>
              <button onClick={()=>{this.setState({edit: false}); this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);}} className={styles.middle}>Save</button>
              <button onClick={()=>{this.setState({edit: false})}} className={styles.delete}>Cancel</button>
            </span>
          </div>
      ) : (
        <div className={styles.group}>
            <span className={styles.smallTitle}>{path.basename(this.state.dir)}</span>
            <span style={{paddingLeft: "10px", paddingRight: "10px"}} className={styles.clickable} onClick={this.toggleEdit}><FontAwesomeIcon icon={faEdit} /></span>
            <span className={styles.inputGroupSmall}>
              <button onClick={this.addFilter} className={styles.add}>Add filter</button>
              <button onClick={this.delete} className={styles.delete}>Delete</button>
            </span>
          </div>
      )
      return (
        <div className={styles.directory}>
          
          {header}
          {filterItems}
        </div>
      );
  }
}
export default DirectoryItem;