import React from 'react';
import {inject, observer} from 'mobx-react';
import 'xterm/dist/xterm.css';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Tabs} from "antd";
import {Measure} from '@pinyin/measure'

Xterm.applyAddon(fit);


class Term extends React.Component {
  constructor(props) {
    super(props);

    this.dom = React.createRef();
    this.state = {
      activeKey: props.scenario.terminals[0].id,
    };
  }

  componentDidMount() {
    this.props.scenario.terminals[0].terminal.open(this.dom);
    this.props.scenario.terminals[0].terminal.fit();
    this.props.scenario.terminals[0].terminal.clear();
    setTimeout(() => {
      try {
        this.props.scenario.terminals[0].resize(parseInt(this.dom.offsetWidth / 10), parseInt(this.dom.offsetHeight / 16));
      } catch (e) {
        console.log(e)
      }
    }, 2000);
  }

  resize(obj) {
    try {
      this.props.scenario.terminals[0].terminal.fit();
      this.props.scenario.terminals[0].resize(parseInt(this.dom.offsetWidth / 10), parseInt(this.dom.offsetHeight / 16));
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        onEdit={this.onEdit}
        style={{height: '100%'}}
      >
        {this.props.scenario.terminals.map(pane => <Tabs.TabPane tab='Terminal' key={pane.id} closable='false'
                                                                 style={{height: '100%'}}>
          <Measure onResize={(obj) => this.resize(obj)}>
            <div ref={dom => this.dom = dom} style={{height: 'calc(100vh - 122px)'}}></div>
          </Measure>
        </Tabs.TabPane>)}
      </Tabs>

    )
  }
}

export default inject('store')(observer(Term));
