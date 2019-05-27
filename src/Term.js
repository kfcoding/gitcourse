import React from 'react';
import {inject, observer} from 'mobx-react';
import 'xterm/dist/xterm.css';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Tabs} from "antd";
import {Measure} from '@pinyin/measure'
import {withRouter} from "react-router-dom";

Xterm.applyAddon(fit);


class Term extends React.Component {

    dom = React.createRef();

  componentDidMount() {

    let scenario = this.props.store.course.scenarios[this.props.match.params.index];

    scenario.terminals[0].terminal.open(this.dom);
    scenario.terminals[0].terminal.fit();
    scenario.terminals[0].terminal.clear();
    setTimeout(() => {
      try {
        scenario.terminals[0].resize(parseInt(this.dom.offsetWidth / 10), parseInt(this.dom.offsetHeight / 16));
      } catch (e) {
        console.log(e)
      }
    }, 2000);
  }

  resize(obj) {

    let scenario = this.props.store.course.scenarios[this.props.match.params.index];
    try {
      scenario.terminals[0].terminal.fit();
      scenario.terminals[0].resize(parseInt(this.dom.offsetWidth / 10), parseInt(this.dom.offsetHeight / 16));
    } catch (e) {
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
