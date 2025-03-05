import React from 'react';
import { Typography, Card, Form, Select, Button, Slider, Divider, Row, Col, Progress } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const SchemeOptimizer: React.FC = () => {
  return (
    <div>
      <Title level={2}>方案优化器</Title>
      <Divider />
      
      <Row gutter={16}>
        <Col span={16}>
          <Card title="优化设置">
            <Form layout="vertical">
              <Form.Item label="选择基础方案">
                <Select defaultValue="scheme1">
                  <Option value="scheme1">故宫一日游</Option>
                  <Option value="scheme2">北京三日游</Option>
                  <Option value="scheme3">长城一日游</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="优化目标">
                <Select mode="multiple" defaultValue={['cost', 'experience']}>
                  <Option value="cost">成本最小化</Option>
                  <Option value="time">时间最优化</Option>
                  <Option value="experience">体验最大化</Option>
                  <Option value="coverage">景点覆盖最大化</Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="优化强度">
                <Slider defaultValue={30} marks={{ 0: '保守', 50: '平衡', 100: '激进' }} />
              </Form.Item>
              
              <Form.Item label="优化算法">
                <Select defaultValue="genetic">
                  <Option value="genetic">遗传算法</Option>
                  <Option value="simulated">模拟退火</Option>
                  <Option value="hill">爬山算法</Option>
                </Select>
              </Form.Item>
              
              <Button type="primary" block>开始优化</Button>
            </Form>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="优化进度" style={{ marginBottom: 16 }}>
            <Progress percent={0} status="active" />
            <div style={{ marginTop: 16 }}>
              <p>状态: 等待开始</p>
              <p>已生成方案: 0</p>
              <p>最佳评分: -</p>
            </div>
          </Card>
          
          <Card title="历史优化">
            <p>故宫方案 v2 (昨天)</p>
            <p>长城方案 v3 (3天前)</p>
            <p>北京三日游 v1 (上周)</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SchemeOptimizer; 