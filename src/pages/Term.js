import React from 'react';
import {inject, observer} from 'mobx-react';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Measure} from '@pinyin/measure'
import 'xterm/dist/xterm.css';
Xterm.applyAddon(fit);

class Term extends React.Component {

  dom = React.createRef();

  componentDidMount() {
    const store=this.props.store
    const course=store.course;
    const index=store.currentIndex;
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
    const store=this.props.store
    const course=store.course;
    const index=store.currentIndex;
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
    const store=this.props.store;
    const compact=store.course.compact;
    const isFull=store.isFull;
    let height='calc(100vh - 108px)';
    if(compact){
      height='calc(100vh - 44px)';
    }
    if(isFull){
      height='calc(100vh - 60px)';
    }
    return (
      <Measure onResize={(obj) => this.resize(obj)}>
        <div ref={dom => this.dom = dom} style={{height: height}}/>
      </Measure>
    )
  }
}

export default inject('store')(observer(Term));
