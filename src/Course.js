import React, {Component} from 'react';
import './App.css';
import {Layout, Menu, Card, Icon, Col, Row, List, Button} from 'antd';
import {inject, observer} from "mobx-react";
import {Link} from "react-router-dom";


class Course extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div style={{padding: 50}}>
        <Row gutter={16}>
          <Col span={18}>
            <Card style={{marginBottom: 30}}>
              <h1>{this.props.store.course.title}</h1>
              {this.props.store.course.description}
            </Card>
            <Card title='课程列表' style={{marginBottom: 30}}>
              <List itemLayout="horizontal">

                {this.props.store.course.scenarios.map((s, index) => {
                    let color = index < this.props.store.completeIndex ? '#52c41a' : '#ccc';
                    return <List.Item key={s}>
                      <List.Item.Meta
                        avatar={
                          <Icon type="check-circle" theme="twoTone" twoToneColor={color} style={{fontSize: 32}}/>
                        }
                        title={s.title}
                        description={'共 ' + s.steps.length + ' 个步骤'}
                      />
                      {index <= this.props.store.completeIndex ?
                        <Link to={'/scenarios/' + index + window.location.hash}><Button type='primary'>开始学习</Button></Link>
                        :
                        <Button type='default' disabled>请先学习先导课程</Button>
                      }
                    </List.Item>
                  }
                )}
              </List>

            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <a class="github-button" href={this.props.store.repo.substr(0, this.props.store.repo.length - 4)}
                 data-size="large" data-show-count="true"
                 aria-label="Star git/git on GitHub">Star</a>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default inject('store')(observer(Course));
