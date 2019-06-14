import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import {inject, observer} from 'mobx-react';

// function Image(props) {console.log(props)
//   if (props.src.substr(0, 4) == 'http') {
//     return <img {...props} style={{maxWidth: '100%'}}/>
//   } else {
//
//   }
// }

class Image extends Component {
  state = {
    src: this.props.src,
    dsrc: '',
  }

  componentDidMount() {
    if (this.state.src.substr(0, 4) == 'http') {
      this.setState({dsrc: this.state.src});
    } else {
      this.props.store.pfs.readFile(this.props.store.dir + this.props.src).then(d => this.setState({dsrc: window.URL.createObjectURL(new Blob([d]))}));
    }
  }

  render() {
    return (
      <img src={this.state.dsrc} style={{maxWidth: '100%'}}/>
    );
  }
}

class Step extends Component {

  componentDidUpdate() {
    this.props.step.preloadstep();
  }

  componentWillReceiveProps() {

  }

  componentDidMount() {
    console.log("inspect step");
    // this.props.step.inspectstep();
    console.log("before step");
    // this.props.step.beforestep();
    console.log("preload step");
    this.props.step.preloadstep();
  }

  renderImage(props) {
    return <Image store={this.props.store} src={props.src}/>
  }

  render() {
    return (
      <div style={{padding: 20, overflow: 'auto'}}>
        <ReactMarkdown source={this.props.step.content} renderers={{inlineCode: CodeBlock, code: CodeBlock, image: this.renderImage.bind(this)}} linkTarget='_blank'/>
      </div>
    )
  }
}

export default inject('store')(observer(Step));
