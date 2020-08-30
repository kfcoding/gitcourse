import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Button, Icon, Modal, notification} from "antd";
import SplitPane from "react-split-pane";
import Fullscreen from "react-full-screen";
import Step from "./Step";
import TrainPanel from "./TrainPanel";

class Scenario extends Component {

  state = {
    isDragging: false,
    loading:false,
    isFull: false,
    firstPaneSize: 450,
  };

  getCurrent(){
    const store=this.props.store;
    const index=store.currentIndex;
    return store.course.scenarios[index];
  }

  componentWillUpdate() {
    const current=this.getCurrent();
    if (current){
      if(!current.creating){
        current.createContainer();
      }
    }
  }

  componentDidMount() {
    const current=this.getCurrent();
    if (current){
      current.createContainer();
    }
    this.props.beforeScenario(this.props);
  }

  componentWillUnmount() {
    const current=this.getCurrent();
    if(current){
      current.clearContainer();
    }
  }

  setComplete() {
    const store=this.props.store;
    const index=store.currentIndex;
    if (index === store.completeIndex) {
      store.setCompleteIndex(index + 1);
    }
  }

  openNotification() {
    notification['info']({
      message: '提示',
      description: '您还未完成本步骤的内容！',
    });
  }

  handlePaneSizeChange = currentPaneSize => {
    const store=this.props.store;
    const showGuide=store.showGuide;
    if(showGuide){
      this.setState({
        firstPaneSize: currentPaneSize
      });
    }else{
      store.setShowGuide(true);
      this.setState({
        firstPaneSize: currentPaneSize
      });
    }
  };

  render() {
    const store=this.props.store;
    const compact=store.course.compact;
    const scenarioIndex=store.currentIndex;
    const length=store.course.scenarios.length;//don't remove this line
    const scenarioCurrent = store.course.scenarios[scenarioIndex];
    if (!scenarioCurrent) {
      return <div/>
    }
    const {isDragging,firstPaneSize}=this.state;
    const stepIndex=scenarioCurrent.stepIndex;
    const stepCurrent=scenarioCurrent.steps[stepIndex];
    const isFull=store.isFull;
    return (
      <Fullscreen
        enabled={isFull}
        onChange={isFull => store.setIsFull(isFull)}
      >
        <div
          style={{background: '#fff'}}
        >
          <SplitPane
            split="vertical"
            minSize={350}
            size={store.showGuide? firstPaneSize : 0}
            onChange={this.handlePaneSizeChange}
            style={{position: 'relative'}}
            onDragStarted={() => {
              this.setState({
                isDragging: true,
              });
            }}
            onDragFinished={() => {
              this.setState({
                isDragging: false,
              });
            }}
          >
            <div>
              <div style={{
                height: 40,
                lineHeight: '40px',
                textAlign: 'center',
                fontSize: 24,
                background: '#3095d2',
                color: '#fff'
              }}>
                {scenarioCurrent.title}
              </div>
              <div id="guide" style={{overflow: 'auto',height:compact?"calc(100vh - 112px)":"calc(100vh - 176px)"}}>
                <Step step={stepCurrent} scenario={scenarioCurrent}/>
              </div>
              <div style={{position: 'relative', width: '100%'}}>
                {
                  stepIndex !== scenarioCurrent.steps.length - 1 &&!compact&&
                  <div style={{textAlign: 'center', position: 'absolute', width: '100%'}}>
                    <Button type="primary" style={{margin:20}} onClick={() => {
                      scenarioCurrent.removeContainer();
                      scenarioCurrent.setStepIndex(0);
                      store.setCurrentIndex(-1);
                    }}>
                      <Icon type="book"/>
                      返回目录
                    </Button>
                  </div>
                }
                {
                  stepIndex !== 0 &&
                  <Button type="default" style={{margin:20}} onClick={() => {
                    scenarioCurrent.setStepIndex(stepIndex - 1);
                    document.getElementById('guide').scrollTop=0;
                  }}>
                    <Icon type="left"/>
                    上一步
                  </Button>
                }
                {
                  stepIndex !== scenarioCurrent.steps.length - 1 &&
                  <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
                    stepCurrent.checkStep().then(data => {
                      if (data === true){
                        scenarioCurrent.setStepIndex(stepIndex + 1);
                        document.getElementById('guide').scrollTop=0;
                      }
                      else{
                        this.openNotification();
                      }
                    });
                  }}>
                    <Icon type="right"/>
                    下一步
                  </Button>
                }
                {
                  stepIndex === scenarioCurrent.steps.length - 1 &&!compact&&
                  <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
                    stepCurrent.checkStep().then(data => {
                      if (data === true) {
                        scenarioCurrent.removeContainer();
                        this.setComplete();
                        this.props.afterScenario(this.props);
                        store.setCurrentIndex(-1);
                      }
                      else {
                        this.openNotification();
                      }
                    });
                  }}>
                    <Icon type="book"/>
                    完成
                  </Button>
                }
              </div>
            </div>
            <div style={{height: '100%', overflow: 'hidden',pointerEvents:isDragging?'none':'auto'}}>
              <TrainPanel scenario={scenarioCurrent} stepIndex={stepIndex}/>
            </div>
          </SplitPane>
        </div>
      </Fullscreen>
    )
  }
}

Scenario.defaultProps={
  beforeScenario:function () {},
  afterScenario:function () {}
}

export default inject('store')(observer(Scenario));