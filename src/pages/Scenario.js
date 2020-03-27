import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import {Button,Icon, notification, Modal} from "antd";
import SplitPane from "react-split-pane";
import Fullscreen from "react-full-screen";
import Step from "./Step";
import ImageMakerWithForm from "./ImageMaker";
import TrainPanel from "./TrainPanel";
notification.config({
  duration: 0,
});

function showModal() {
  Modal.success({
    title: 'Congratulations!',
    content: '恭喜你！你已完成全部实训课程！',
  });
}

class Scenario extends Component {
  state = {
    stepIndex:0,
    isDragging: false,
    loading:false,
    isFull: false,
    firstPaneSize: 450,
  };

  componentWillUpdate() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    if (current){
      if(!current.creating){
        current.createContainer();
      }
    }
  }

  componentDidMount() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    if (current){
      current.createContainer();
    }
  }

  componentWillUnmount() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    current.clearContainer();
  }

  setComplete() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    if (index * 1 === store.completeIndex * 1) {
      store.setCompleteIndex(index * 1 + 1);
    }
  }

  openNotification() {
    notification['info']({
      message: '提示',
      description: '您还未完成本步骤的内容！',
    });
  }

  reloadImage=image=>{
    const store=this.props.store;
    const index=this.props.match.params.index;
    const scenario=store.course.scenarios[index];
    scenario.clearContainer();
    scenario.setImage(image);
    scenario.createContainer();
    scenario.afterCreate();
  };

  handlePaneSizeChange = currentPaneSize => {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const scenario=store.course.scenarios[index];
    const showGuide=scenario.showGuide;
    if(showGuide){
      this.setState({
        firstPaneSize: currentPaneSize
      });
    }
  };

  render() {
    const edit=window.location.search.search("edit=true") !== -1;
    const compact=window.location.search.search("compact=true") !== -1;
    const store=this.props.store;
    const index=this.props.match.params.index;
    const scenario = store.course.scenarios[index];
    store.course.setIndex(index);
    if (!scenario) {
      return <div/>
    }
    const {stepIndex,isDragging,firstPaneSize}=this.state;
    const step=scenario.steps[stepIndex];
    const isFull=scenario.isFull;
    return (
      <Fullscreen
        enabled={isFull}
        onChange={isFull => scenario.setIsFull(isFull)}
      >
        <div
          style={{background: '#fff'}}
        >
          <SplitPane
            split="vertical"
            defaultSize={edit ? '70%' : '100%'}
            style={{position: 'relative'}}
          >
            <SplitPane
              split="vertical"
              minSize={350}
              size={scenario.showGuide? firstPaneSize : 0}
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
                  {scenario.title}
                </div>
                <div style={{overflow: 'auto',height:isFull?'calc(100vh - 112px)':'calc(100vh - 176px)'}}>
                  <Step step={step} scenario={scenario}/>
                </div>
                <div style={{position: 'relative', width: '100%'}}>
                  {
                    stepIndex !== scenario.steps.length - 1 &&!compact&&
                    <div style={{textAlign: 'center', position: 'absolute', width: '100%'}}>
                      <Button type="primary" style={{margin:20}} onClick={() => {
                        scenario.removeContainer();
                        scenario.setStepIndex(0);
                        if(edit){
                          this.props.history.push('/?edit=true' + window.location.hash);
                        }else{
                          this.props.history.push('/' + window.location.hash);
                        }
                      }}>
                        <Icon type="book"/>
                        返回目录
                      </Button>
                    </div>
                  }
                  {
                    stepIndex !== 0 &&
                    <Button type="default" style={{margin:20}} onClick={() => {
                      scenario.setStepIndex(stepIndex - 1);
                      this.setState({
                        stepIndex:stepIndex-1
                      })
                    }}>
                      <Icon type="left"/>
                      上一步
                    </Button>
                  }
                  {
                    stepIndex !== scenario.steps.length - 1 &&
                    <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
                      if(edit){
                        scenario.setStepIndex(stepIndex + 1);
                        this.setState({
                          stepIndex:stepIndex+1
                        })
                      }
                      else{
                        step.checkStep().then(data => {
                          if (data === true){
                            scenario.setStepIndex(stepIndex + 1);
                            this.setState({
                              stepIndex:stepIndex+1
                            })
                          }
                          else{
                            this.openNotification();
                          }
                        });
                      }
                    }}>
                      <Icon type="right"/>
                      下一步
                    </Button>
                  }
                  {
                    stepIndex === scenario.steps.length - 1 &&!compact&&
                    <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
                      if(edit){
                        scenario.removeContainer();
                        this.setComplete();
                        setTimeout(() => {
                          this.props.history.push('/' + window.location.hash);
                        }, 500);
                        return
                      }
                      step.checkStep().then(data => {
                        if (data === true) {
                          scenario.removeContainer();
                          this.setComplete();
                          setTimeout(() => {
                            this.props.history.push('/' + window.location.hash);
                          }, 500);
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
                  {
                    stepIndex === scenario.steps.length - 1 &&
                    index === store.course.scenarios.length - 1 &&
                    showModal()
                  }
                </div>
              </div>
              <div style={{height: '100%', overflow: 'hidden',pointerEvents:isDragging?'none':'auto'}}>
                <TrainPanel scenario={scenario} step={stepIndex}/>
              </div>
            </SplitPane>
            {
              edit&&
              <ImageMakerWithForm />
            }
          </SplitPane>
        </div>
      </Fullscreen>
    )
  }
}
export default inject('store')(observer(Scenario));
