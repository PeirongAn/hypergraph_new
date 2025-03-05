import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, Select, Switch, Card, Tabs, Radio, Slider, Divider, Typography, Row, Col, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RuleEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  
  return (
    <div>
      <Title level={2}>{isEditing ? '编辑规则' : '创建新规则'}</Title>
      <Divider />
      
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="规则名称" required>
                  <Input defaultValue={isEditing ? "周一闭馆规则" : ""} placeholder="输入规则名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="规则类型" required>
                  <Radio.Group defaultValue="hard">
                    <Radio.Button value="hard">硬约束</Radio.Button>
                    <Radio.Button value="soft">软约束</Radio.Button>
                    <Radio.Button value="dynamic">动态触发</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane tab="条件" key="conditions">
          <Button type="dashed" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加条件
          </Button>
        </TabPane>
        <TabPane tab="动作" key="actions">
          <Button type="dashed" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
            添加动作
          </Button>
        </TabPane>
      </Tabs>
      
      <Divider />
      
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" size="large">
          {isEditing ? '保存修改' : '创建规则'}
        </Button>
      </div>
    </div>
  );
};

export default RuleEditor; 