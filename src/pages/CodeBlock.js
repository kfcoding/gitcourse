import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
class CodeBlock extends React.Component {

  render() {
    return (
      <SyntaxHighlighter language="shell" style={vs2015}>
        {this.props.value}
      </SyntaxHighlighter>
    )
  }
}

export default CodeBlock;
