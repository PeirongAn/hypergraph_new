import React from 'react';
import { Typography, Form, Input, Button, Switch, Select, Divider, Card } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const HypergraphSettings: React.FC = () => {
  return (
    <div>
      <Title level={2}>超图设置</Title>
      <Divider />
      
      <Card title="基本设置" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="超图名称" required>
            <Input defaultValue="旅游规划超图" />
          </Form.Item>
          
          <Form.Item label="描述">
            <Input.TextArea defaultValue="用于旅游路线规划的分层超图" rows={3} />
          </Form.Item>
          
          <Form.Item label="可见性">
            <Select defaultValue="private">
              <Option value="private">私有</Option>
              <Option value="team">团队可见</Option>
              <Option value="public">公开</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="高级设置">
        <Form layout="vertical">
          <Form.Item label="启用动态规则引擎">
            <Switch defaultChecked />
          </Form.Item>
          
          <Form.Item label="规则冲突检测">
            <Switch defaultChecked />
          </Form.Item>
          
          <Form.Item label="优化算法">
            <Select defaultValue="genetic">
              <Option value="genetic">遗传算法</Option>
              <Option value="simulated">模拟退火</Option>
              <Option value="hill">爬山算法</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
      
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary">保存设置</Button>
      </div>
    </div>
  );
};

export default HypergraphSettings; 