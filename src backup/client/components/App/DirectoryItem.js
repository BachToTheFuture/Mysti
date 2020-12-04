import React from 'react';
import styles from './styles.sass';
import FilterItem from './FilterItem';

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
        this.setState({
            edit: false
        });
        this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);
    }
  }
  updateDirDirect = () => {
    this.props.updateDir(this.state.dir, this.state.filters, this.props.idx);
  }

  render() {
    // Update with initials
    console.log("FILTERSsdfsdf");
    console.log(this.props.dir);
    console.log(this.props.filters);


      let filterItems = [];
      for (var i = 0; i < this.state.filters.length; i++) {
        if (this.state.filters[i].new) {
          delete this.state.filters[i].new;
          filterItems.push(<FilterItem updateDir={this.updateDirDirect} updateFilter={this.updateFilter} key={i} idx={i} edit={true} filter={this.state.filters[i].filter} dir={this.state.filters[i].dir}/>);
        }
        else filterItems.push(<FilterItem updateDir={this.updateDirDirect} updateFilter={this.updateFilter} idx={i} key={i} filter={this.state.filters[i].filter} dir={this.state.filters[i].dir}/>);
      }
      let header = this.state.edit ? (
        <input className={styles.dirInput} value={this.state.dir} onChange={event => this.setDir(event.target.value)} type="text" onKeyPress={this.handleKeyPress} placeholder="Directory..." name="directory"></input>
      ) : (
        <span onClick={this.toggleEdit} className={styles.smallTitle}>{this.state.dir}</span>
      )
      return (
        <div className={styles.directory}>
            {header}
            <span className={styles.inputGroupSmall}>
              <button onClick={this.addFilter} className={styles.add}>Add filter</button>
              <button className={styles.edit}>Edit filters</button>
            </span>
            {filterItems}
        </div>
      );
  }
}
export default DirectoryItem;