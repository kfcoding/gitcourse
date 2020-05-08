import React, {Component} from "react";
import {inject, observer} from "mobx-react";

class Image extends Component {
  state = {
    src: this.props.src,
    dsrc: '',
  };

  async componentDidMount() {
    if (this.state.src.substr(0, 4) === 'http') {
      this.setState({dsrc: this.state.src});
    }
    else {
      const fs=this.props.store.pfs;
      const path=`${this.props.store.dir}${this.props.src}`;
      try{
        const data=await fs.readFile(path);
        this.setState({
          dsrc: window.URL.createObjectURL(new Blob([data]))
        })
      }
      catch (e) {
        console.log(e);
      }
    }
  }

  render() {
    return (
      <img src={this.state.dsrc} style={{maxWidth: '100%'}} alt={this.state.dsrc}/>
    );
  }
}
export default inject('store')(observer(Image));