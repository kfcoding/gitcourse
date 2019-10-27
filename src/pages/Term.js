import React from 'react';
import {inject, observer} from 'mobx-react';
import 'xterm/dist/xterm.css';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Measure} from '@pinyin/measure'
import {withRouter} from "react-router-dom";

Xterm.applyAddon(fit);


class Term extends React.Component {
  dom = React.createRef();

  componentDidMount() {
    const course=this.props.store.course;
    const index=this.props.match.params.index;
    let scenario = course.scenarios[index];
    const terminal=scenario.terminals[0];
    terminal.terminal.open(this.dom);
    terminal.terminal.fit();
    terminal.terminal.clear();
    setTimeout(() => {
      try {
        const width=parseInt(this.dom.offsetWidth / 10);
        const height=parseInt(this.dom.offsetHeight / 16);
        terminal.resize(width,height);
      }
      catch (e) {
        console.log(e)
      }
    }, 2000);
  }

  resize(obj) {
    const course=this.props.store.course;
    const index=this.props.match.params.index;
    let scenario = course.scenarios[index];
    try {
      const terminal=scenario.terminals[0];
      terminal.terminal.fit();
      const width=parseInt(this.dom.offsetWidth / 10);
      const height=parseInt(this.dom.offsetHeight / 16);
      terminal.resize(width,height);
    }
    catch (e) {
      console.log(e)
    }
  }

  render() {
    return (
      <Measure onResize={(obj) => this.resize(obj)}>
        <div ref={dom => this.dom = dom} style={{height: 'calc(100vh - 122px)'}}/>
      </Measure>
    )
  }
}

export default inject('store')(observer(withRouter(Term)));
