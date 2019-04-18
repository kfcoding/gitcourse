import React, {Component} from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import {inject, observer} from 'mobx-react';

class Step extends Component {

  componentWillUpdate() {
    this.props.step.preloadstep();
  }

  componentWillReceiveProps() {
    this.props.step.preloadstep();
  }

  componentDidMount() {
    this.props.step.preloadstep();
  }

  render() {
    return (
      <div style={{padding: 20, overflow: 'auto'}}>
        <ReactMarkdown source={this.props.step.content} renderers={{inlineCode: CodeBlock, code: CodeBlock}} linkTarget='_blank'/>
      </div>
    )
  }
}

export default inject('store')(observer(Step));
