import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import {inject, observer} from 'mobx-react';

class Image extends Component {
  state = {
    src: this.props.src,
    dsrc: '',
  };

  componentDidMount() {
    if (this.state.src.substr(0, 4) === 'http') {
      this.setState({dsrc: this.state.src});
    } else {
      const path=`${this.props.store.dir}${this.props.src}`;
      this.props.store.pfs.readFile(path)
          .then(data =>
              this.setState({
                dsrc: window.URL.createObjectURL(new Blob([data]))
              })
          );
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
    this.props.step.preloadStep();
  }

  componentDidMount() {
    // console.log("inspect step");
    // this.props.step.inspectStep();
    // console.log("before step");
    // this.props.step.beforeStep();
    console.log("preload step");
    this.props.step.preloadStep();
  }

  renderImage(props) {
    return <Image store={this.props.store} src={props.src}/>
  }

  render() {
    return (
      <div style={{padding: 20, overflow: 'auto'}}>
        <ReactMarkdown
            source={this.props.step.content}
            renderers={{inlineCode: CodeBlock, code: CodeBlock, image: this.renderImage.bind(this)}}
            linkTarget='_blank'
        />
      </div>
    )
  }
}

export default inject('store')(observer(Step));
