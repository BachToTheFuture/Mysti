import React from 'react';
import styles from './styles.sass';
const path = require('path');

const { dialog, ipcRenderer } = window.require('electron');

class FilterItem extends React.Component {
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
    this.setState({
      edit: false
    }, ()=>{
      this.props.updateFilter(this.state.filter, this.state.dir, this.props.idx);
      this.props.updateDir();
    });
  }
  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
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
    // Make the input contenteditable so i can add Numbers and Words
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
        //<button type="button" id="start">?</button>
    else
        return (
            <div className={styles.filter} onClick={this.toggleEdit}>
                <span onClick={this.delete} className={styles.deleteX}>✖</span><span className={styles.filterText}>{this.state.filter}</span><span className={styles.arrow}>➞</span><span className={styles.dirText}>{this.state.dir}</span>
            </div>
        );
  }
}
export default FilterItem;