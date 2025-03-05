import React from 'react';
import { Typography, Card, Row, Col, Statistic, Divider } from 'antd';

const { Title } = Typography;

const HypergraphAnalytics: React.FC = () => {
  return (
    <div>
      <Title level={2}>超图分析</Title>
      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="要素总数" value={42} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="规则总数" value={18} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="方案总数" value={7} />
          </Card>
        </Col>
      </Row>
      
      <Divider>关系统计</Divider>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="层级间连接">
            <Statistic title="要素-规则连接" value={24} />
            <Statistic title="规则-方案连接" value={15} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="规则类型分布">
            <Statistic title="硬约束" value={8} />
            <Statistic title="软约束" value={6} />
            <Statistic title="动态触发" value={4} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HypergraphAnalytics; 