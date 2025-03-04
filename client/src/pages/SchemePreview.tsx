import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, List, Tag, Button, Divider, Spin, Empty } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SchemePreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  
  // 从location.state获取方案数据
  const schemeData = location.state?.schemeData;
  
  // 如果没有方案数据，显示空状态
  if (!schemeData) {
    return (
      <div style={{ padding: '20px' }}>
        <Card>
          <Empty 
            description="没有方案数据" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={() => navigate('/schemes/create')}>
              创建新方案
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // 提取方案、规则和要素数据
  const scheme = schemeData;
  const schemeRuleHyperedge = scheme.scheme_rule_hyperedge || { rules: [] };
  const ruleElementHyperedges = scheme.rule_element_hyperedges || [];
  
  // 获取所有要素
  const allElements: any[] = [];
  ruleElementHyperedges.forEach((hyperedge: any) => {
    hyperedge.elements.forEach((element: any) => {
      if (!allElements.some(e => e.id === element.id)) {
        allElements.push(element);
      }
    });
  });
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>方案预览</Title>
      <Text>查看方案、规则和要素之间的关系</Text>
      
      <Divider />
      
      <Row gutter={16}>
        {/* 方案列 */}
        <Col span={8}>
          <Card 
            title={<Title level={4}>方案</Title>} 
            style={{ height: '100%' }}
            headStyle={{ backgroundColor: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={5}>{scheme.name}</Title>
              <Text type="secondary">{scheme.description || '无描述'}</Text>
            </div>
            
            <Divider dashed />
            
            <div>
              <Text strong>创建时间：</Text>
              <Text>{new Date(scheme.created_at).toLocaleString()}</Text>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <Text strong>规则数量：</Text>
              <Text>{schemeRuleHyperedge.rules?.length || 0}</Text>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <Text strong>影响要素数量：</Text>
              <Text>{allElements.length}</Text>
            </div>
          </Card>
        </Col>
        
        {/* 规则列 */}
        <Col span={8}>
          <Card 
            title={<Title level={4}>规则 <ArrowRightOutlined /></Title>} 
            style={{ height: '100%' }}
            headStyle={{ backgroundColor: '#f6ffed', borderBottom: '2px solid #52c41a' }}
          >
            <List
              itemLayout="vertical"
              dataSource={schemeRuleHyperedge.rules || []}
              renderItem={(rule: any) => (
                <List.Item>
                  <div>
                    <Title level={5}>{rule.name}</Title>
                    <Text type="secondary">{rule.description || '无描述'}</Text>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>权重：</Text>
                    <Tag color="green">{rule.weight}</Tag>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>影响要素类型：</Text>
                    {rule.affected_element_types?.map((type: string) => (
                      <Tag key={type}>{type}</Tag>
                    ))}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        {/* 要素列 */}
        <Col span={8}>
          <Card 
            title={<Title level={4}>要素 <CheckCircleOutlined /></Title>} 
            style={{ height: '100%' }}
            headStyle={{ backgroundColor: '#fff7e6', borderBottom: '2px solid #fa8c16' }}
          >
            <List
              itemLayout="vertical"
              dataSource={allElements}
              renderItem={(element: any) => (
                <List.Item>
                  <div className='flex justify-between'>
                    <Title level={5}>{element.element_name}</Title>
                    <Tag color="blue">{element.element_type}</Tag>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    {Object.entries(element.attributes || {})
                      .filter(([key]) => key !== 'id' && key !== 'name' && key !== 'type')
                      .map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <Text strong>{key}：</Text>
                          <Text>{Array.isArray(value) ? value.join(', ') : value}</Text>
                        </div>
                      ))
                    }
                  </div>
                  
                  {/* {element.score && (
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>得分：</Text>
                      <Tag color="orange">{element.score.toFixed(2)}</Tag>
                    </div>
                  )} */}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button type="primary" onClick={() => navigate('/schemes')}>
          返回方案列表
        </Button>
      </div>
    </div>
  );
};

export default SchemePreview; 