import React, {Component} from 'react';
import {Card, Icon, Col, Row, List, Button, Progress} from 'antd';
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";

class Course extends Component {

  render() {
    const store=this.props.store;
    const course=store.course;
    const edit=window.location.search.search("edit=true") !== -1;
    return (
      <div style={{padding: 50}}>
        <Row gutter={16}>
          <Col span={18}>
            <Card style={{marginBottom: 30}}>
              <h1>
                {course.title}
              </h1>
              {course.description}
            </Card>
            <Card
              title='课程列表'
              style={{marginBottom: 30}}
              extra={`共${course.scenarios.length}个场景，大约需要${course.needTime}分钟`}
            >
              <List itemLayout="horizontal">
                {course.scenarios.map((scenario, index) => {
                  let color = index < store.completeIndex ? '#52c41a' : '#ccc';
                  return (
                    <List.Item key={scenario}>
                      <List.Item.Meta
                        avatar={
                          <Icon type="check-circle" theme="twoTone" twoToneColor={color} style={{fontSize: 32}}/>
                        }
                        title={scenario.title}
                        description={
                          <div>
                            {
                              scenario.description &&
                              <div>{scenario.description}</div>
                            }
                            <div>共{scenario.steps.length}个步骤
                              <Icon type="clock-circle" style={{marginLeft: 30}}/> {scenario.needTime}min
                            </div>
                          </div>
                        }
                      />
                      {
                        index <= store.completeIndex||edit?
                          (edit?
                            <Link to={`/scenarios/${index}?edit=true${window.location.hash}`}>
                              <Button type='primary'>
                                开始预览
                              </Button>
                            </Link>:
                            <Link to={`/scenarios/${index}${window.location.hash}`}>
                              <Button type='primary'>
                                开始学习
                              </Button>
                            </Link>
                          )
                        :
                        <Button type='default' disabled>请先学习先导课程</Button>
                      }
                    </List.Item>
                  )
                  }
                )}
              </List>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <div style={{textAlign: 'center'}}>
                <Progress
                    type="circle"
                    percent={Number.parseInt(store.completeIndex / course.scenarios.length * 100)}
                />
                <div>{edit?"预览情况":"完成情况"}</div>
                {
                  edit &&
                  <Link to={`/project/?edit=true${window.location.hash}`}>
                    <Button type='primary' style={{marginTop:"50px"}}>
                      编辑课程
                    </Button>
                  </Link>
                }
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default inject('store')(observer(Course));
