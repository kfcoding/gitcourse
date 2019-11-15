import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import Image from './Image';
import {inject, observer} from 'mobx-react';

class Step extends Component {

  componentDidUpdate() {
    this.props.step.preloadStep();
  }

  componentDidMount() {
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
