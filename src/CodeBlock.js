import React from 'react';
import Highlight from 'react-highlight'

class CodeBlock extends React.Component {
  // propTypes: {
  //   literal: React.PropTypes.string,
  //   language: React.PropTypes.string,
  //   inline: React.PropTypes.bool
  // },


  render() {
    return (
      <Highlight className='bash'>
        {this.props.value}
      </Highlight>
    )
  }
}

export default CodeBlock;
