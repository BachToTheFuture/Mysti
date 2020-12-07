import React from 'react';
import styles from './styles.sass';
const path = require('path');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

const { dialog, ipcRenderer } = window.require('electron');

class FilterItem extends React.Component {
  /*
  FilterItem is a component for each of the little filters inside a directory.
  This component has two modes: view mode and edit mode.
  */
  constructor(props) {
    super(props);
    this.state = {
      edit: props.edit || false,
      filter: props.filter || "",
      dir: props.dir || ""
    };
  }
  componentWillReceiveProps(props) {
    this.setState({
      dir: props.dir,
      filter: props.filter,
    })
  }
  update = () => {
    /*
    When a filter is updated, it also updates the directory that contains this filter.
    */
    this.setState({
      edit: false
    }, ()=>{
      this.props.updateFilter(this.state.filter, this.state.dir, this.props.idx);
      this.props.updateDir();
    });
  }
  handleKeyPress = (event) => {
    // Allow users to save changes just by pressing enter in any textbox.
    if (event.key === 'Enter'){
        this.update()
    }
  }
  setFilter = (filter) => {
    this.setState({ filter: filter });
  }
  setDir = (dir) => {
    this.setState({ dir: dir });
  }
  toggleEdit = () => {
    this.setState({
        edit: true
    });
  }
  cancel = () => {
    this.setState({
      edit: false
    });
  }
  /*
  These are for the "Sample Templates" buttons.
  These simply append some prewritten regex patterns to the textbox.
  */
  addNumber = () => {
    document.getElementById("filter"+this.props.idx).value += "(\\d+)";
  }
  addWord = () => {
    document.getElementById("filter"+this.props.idx).value += "(\\w+)";
  }
  delete = () => {
    this.props.deleteFilter(this.props.idx);
  }
  render() {
    const { edit } = this.state;
    // The edit mode
    if (edit)
        return (
            <div className={styles.filterEdit}>
                <br></br>
                <span style={{paddingTop: "20px"}} className={styles.helperText}>Regex for filename</span>
                <br></br>
                <span className={styles.badge}><b>Sample templates: </b></span>
                <span onClick={this.addNumber} className={styles.numberBadge}>Number</span>
                <span onClick={this.addWord} className={styles.wordBadge}>Word</span>
                <input
                  id={"filter"+this.props.idx}
                  className={styles.filterInput}
                  value={this.state.filter}
                  onChange={event => this.setFilter(event.target.value)}
                  onKeyPress={this.handleKeyPress} type="text"
                  placeholder="Filter..." name="filter">
                </input>
                <br></br>
                <br></br>
                <span className={styles.helperText}>Target directory</span>
                <input className={styles.dirInput} value={this.state.dir} onChange={event => this.setDir(event.target.value)} type="text" onKeyPress={this.handleKeyPress} placeholder="Directory..." name="directory"></input>
                <br></br>
                <br></br>
                <span className={styles.inputGroup}>
                  <button onClick={this.update} className={styles.add}> Save filter </button>
                  <button onClick={this.cancel} className={styles.edit}> Cancel </button>
                </span>
            </div>
        );
    else
        // View mode
        return (
            <div className={styles.filter}>
                <span onClick={this.delete} className={styles.deleteX}>✖</span><span className={styles.clickable} onClick={this.toggleEdit}><FontAwesomeIcon icon={faEdit} /></span><span className={styles.filterText}>{this.state.filter}</span><span className={styles.arrow}>➞</span><span className={styles.dirText}>{this.state.dir}</span>
            </div>
        );
  }
}
export default FilterItem;