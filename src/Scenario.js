import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import {resolvePath} from "mobx-state-tree";
import Step from "./Step";
import Term from "./Term";
import {Button, Icon, notification} from "antd";
import {Link} from "react-router-dom";

class Scenario extends Component {
  state = {
    stepIndex: 0
  }

  componentDidMount() {
    this.props.store.course.scenarios[this.props.match.params.index].createContainer();
    if (this.props.match.params.index == this.props.store.completeIndex) {
      this.props.store.setCompleteIndex(this.props.match.params.index * 1 + 1);
    }
  }

  componentWillUnmount() {
    this.props.store.course.scenarios[this.props.match.params.index].clearContainer();
  }


  openNotification() {
    notification['info']({
      message: '提示',
      description: '您还未完成本步骤的内容！',
    });
  }

  render() {
    let scenario = this.props.store.course.scenarios[this.props.match.params.index];

    return (
      <SplitPane split="vertical" minSize={50} defaultSize={400} style={{position: 'relative'}}>
        <div style={{height: '100%'}}>
          <div style={{
            height: 40,
            lineHeight: '40px',
            textAlign: 'center',
            fontSize: 24,
            background: '#3095d2',
            color: '#fff'
          }}>{scenario.title}</div>
          <Step step={scenario.steps[this.state.stepIndex]} scenario={scenario}/>
          <div style={{height: 40, padding: 20}}>
            {this.state.stepIndex != 0 &&
            <Button type="default" onClick={() => {
              this.setState({stepIndex: this.state.stepIndex - 1})
            }}>
              <Icon type="left"/>上一步
            </Button>
            }
            {this.state.stepIndex != scenario.steps.length - 1 &&
            <Button type="primary" style={{float: 'right'}} onClick={() => {
              scenario.steps[this.state.stepIndex].checkstep().then(d => {
                if (d == true) {
                  this.setState({stepIndex: this.state.stepIndex + 1})
                } else {
                  this.openNotification();
                }
              });
            }}>
              下一步<Icon type="right"/>
            </Button>
            }
            {this.state.stepIndex == scenario.steps.length - 1 &&
            <Link to={'/' + window.location.hash}><Button type="primary" style={{float: 'right'}}>
              返回目录<Icon type="book"/>
            </Button>
            </Link>
            }
          </div>
        </div>
        <div style={{height: '100%', background: '#000', overflow: 'hidden'}}>
          <Term scenario={scenario} style={{height: '100%'}}/>
        </div>
      </SplitPane>
    )
  }
}

export default inject('store')(observer(Scenario));
