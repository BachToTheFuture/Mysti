import React from 'react';
import styles from './styles.sass';

const { ipcRenderer } = window.require('electron');

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

  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
        this.setState({
            edit: false
        });
        this.props.updateFilter(this.state.filter, this.state.dir, this.props.idx);
        this.props.updateDir();
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
  render() {
    const { edit } = this.state;
    if (edit)
        return (
            <div className={styles.filterEdit}>
                <br></br>
                <span style={{paddingTop: "20px"}} className={styles.helperText}>If file name satisfies the pattern </span>
                <input className={styles.filterInput} value={this.state.filter} onChange={event => this.setFilter(event.target.value)} onKeyPress={this.handleKeyPress} type="text" placeholder="Filter..." name="filter"></input>
                <span className={styles.helperText}>then move to</span>
                <input className={styles.dirInput} value={this.state.dir} onChange={event => this.setDir(event.target.value)} type="text" onKeyPress={this.handleKeyPress} placeholder="Directory..." name="directory"></input>
            </div>
        );
        //<button type="button" id="start">?</button>
    else
        return (
            <div className={styles.filter} onClick={this.toggleEdit}>
                <span className={styles.filterText}>{this.state.filter}</span><span className={styles.arrow}>➞</span><span className={styles.dirText}>{this.state.dir}</span>
            </div>
        );
  }
}
export default FilterItem;