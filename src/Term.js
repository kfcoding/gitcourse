import React from 'react';
import {inject, observer} from 'mobx-react';
import 'xterm/dist/xterm.css';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import {Tabs} from "antd";

Xterm.applyAddon(fit);

// const Div = measure('div');

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
  }

  resize = () => {
    // if (this.props.terminal.terminal)
    //   this.props.terminal.terminal.fit()
  }

  render() {
    return (
      <Tabs
        onChange={this.onChange}
        activeKey={this.state.activeKey}
        onEdit={this.onEdit}
        style={{height: '100%'}}
      >
        {this.props.scenario.terminals.map(pane => <Tabs.TabPane tab='Terminal' key={pane.id} closable='false' style={{height: '100%'}}>
          <div ref={dom => this.dom = dom} style={{width: '1000px', height: '100%'}}></div>
        </Tabs.TabPane>)}
      </Tabs>

    )
  }
}

export default inject('store')(observer(Term));
