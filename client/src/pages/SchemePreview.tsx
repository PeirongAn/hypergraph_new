import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, List, Tag, Button, Divider, Spin, Empty, message } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, AppstoreOutlined, PlusOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import SchemeActions from '../components/SchemeActions';
import RuleActions from '../components/RuleActions';
import ElementActions from '../components/ElementActions';

const { Title, Text } = Typography;

const SchemePreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [allSchemes, setAllSchemes] = useState<any[]>([]);
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null);
  const [activeSchemeDetails, setActiveSchemeDetails] = useState<any>(null);
  
  // 从location.state获取方案数据
  const schemeData = location.state?.schemeData;
  const isNewScheme = location.state?.isNewScheme;
  
  // 获取所有方案
  useEffect(() => {
    const fetchAllSchemes = async () => {
      setLoading(true);
      try {
        const schemes = await hypergraphApi.getAllSchemes();
        console.log('获取到的所有方案:', schemes);
        setAllSchemes(schemes);
        
        // 如果是新生成的方案，则优先显示它
        if (isNewScheme && schemeData) {
          setActiveSchemeId(schemeData.id);
        } else if (!activeSchemeId && schemes.length > 0) {
          setActiveSchemeId(schemes[0].id);
        }
      } catch (error) {
        console.error('获取方案失败:', error);
        message.error('获取方案列表失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllSchemes();
  }, [schemeData, isNewScheme]);
  
  // 当活动方案ID改变时，获取方案详情
  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!activeSchemeId) return;
      
      setLoading(true);
      try {
        // 评估方案以获取详细信息
        const result = await hypergraphApi.evaluateScheme(activeSchemeId);
        console.log('方案详情:', result);
        setActiveSchemeDetails(result);
        
        // 更新方案列表中的评分
        setAllSchemes(prevSchemes => 
          prevSchemes.map(scheme => 
            scheme.id === activeSchemeId 
              ? { ...scheme, scheme_score: result.scheme_score }
              : scheme
          )
        );
      } catch (error) {
        console.error('获取方案详情失败:', error);
        message.error('获取方案详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchemeDetails();
  }, [activeSchemeId]);
  
  // 如果正在加载，显示加载状态
  if (loading && !activeSchemeDetails) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载方案数据..." />
      </div>
    );
  }
  
  // 如果没有方案数据，显示空状态
  if (allSchemes.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <Card>
          <Empty 
            description="没有方案数据" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/scheme-generator')}
            >
              创建新方案
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  

  // 获取方案使用的规则
  const schemeRules = activeSchemeDetails?.scheme_rule_hyperedge?.rules || [];
  // 获取所有要素
  const selectedElements = activeSchemeDetails?.rule_element_hyperedges.map((hyperedge: any) => hyperedge.elements).flat() || [];
  console.log("++++++++++++++++",schemeRules)
  console.log("++++++++++++++++",selectedElements)
  
  // 处理方案激活
  const handleSchemeActivate = async (schemeId: string) => {
    if (schemeId === activeSchemeId) return;
    setActiveSchemeId(schemeId);
  };
  

  
  function getRuleElementTypes(rule_id: string): string[] {
    const rule = activeSchemeDetails?.rule_element_hyperedges.find((rule: any) => rule.rule_id === rule_id);
    if (!rule) return [];
    return Array.from(new Set(rule.elements.map((element: any) => element.element_type)));
  }

  // 刷新数据
  const refreshData = async () => {
    setLoading(true);
    try {
      // 重新获取所有方案
      const schemes = await hypergraphApi.getAllSchemes();
      setAllSchemes(schemes);
      
      // 如果当前有活动方案，重新获取其详情
      if (activeSchemeId) {
        const result = await hypergraphApi.evaluateScheme(activeSchemeId);
        setActiveSchemeDetails(result);
      }
    } catch (error) {
      console.error('刷新数据失败:', error);
      message.error('刷新数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={2}>方案预览</Title>
          
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/scheme-generator')}
            >
              创建新方案
            </Button>
          </div>
        </div>
        
        <Divider />
        
        <Row gutter={16}>
          {/* 方案列 */}
          <Col span={8}>
            <Card 
              title={<Title level={4}>方案 <AppstoreOutlined /></Title>} 
              style={{ height: '100%' }}
              headStyle={{ backgroundColor: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
            >
              <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                {allSchemes.map(scheme => (
                  <div 
                    key={scheme.id} 
                    style={{ 
                      padding: '12px', 
                      marginBottom: '12px', 
                      border: scheme.id === activeSchemeId ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: scheme.id === activeSchemeId ? '#f0f5ff' : 'white'
                    }}
                    onClick={() => handleSchemeActivate(scheme.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ margin: 0 }}>{scheme.name}</Title>
                      <div>
                        {scheme.scheme_score && (
                          <Tag color="green" style={{ marginRight: '8px' }}>
                            {scheme.scheme_score.toFixed(2)}
                          </Tag>
                        )}
                        <SchemeActions scheme={scheme} onSuccess={refreshData} />
                      </div>
                    </div>
                    
                    <Text type="secondary" ellipsis style={{ marginTop: '4px', display: 'block' }}>
                      {scheme.description || '无描述'}
                    </Text>
                    
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>规则：</Text>
                        <Tag color="blue">
                          {(Object.keys(scheme.rule_weights || {}).length || 0)}
                        </Tag>
                      </div>
                    </div>
                    
                    {scheme.id === activeSchemeId && (
                      <div style={{ marginTop: '8px', textAlign: 'right' }}>
                        <Tag color="blue">当前选中</Tag>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          
          {/* 规则列 */}
          <Col span={8}>
            <Card 
              title={<Title level={4}>规则 <ArrowRightOutlined /></Title>} 
              style={{ height: '100%' }}
              headStyle={{ backgroundColor: '#e6f7ff', borderBottom: '2px solid #1890ff' }}
            >
              {loading && !schemeRules.length ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin tip="加载规则..." />
                </div>
              ) : schemeRules.length === 0 ? (
                <Empty description="该方案没有规则" />
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={schemeRules}
                  renderItem={(rule: any) => (
                    <List.Item
                      actions={[
                        <RuleActions key="actions" rule={rule} onSuccess={refreshData} />
                      ]}
                    >
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
                        {getRuleElementTypes(rule.rule_id).map((type: string) => (
                          <Tag key={type}>{type}</Tag>
                        ))}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
          
          {/* 要素列 */}
          <Col span={8}>
            <Card 
              title={<Title level={4}>要素 <CheckCircleOutlined /></Title>} 
              style={{ height: '100%' }}
              headStyle={{ backgroundColor: '#fff7e6', borderBottom: '2px solid #fa8c16' }}
            >
              {loading && !selectedElements.length ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin tip="加载要素..." />
                </div>
              ) : selectedElements.length === 0 ? (
                <Empty description="该方案没有匹配的要素" />
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={selectedElements}
                  renderItem={(element: any) => (
                    <List.Item
                      actions={[
                        <ElementActions key="actions" element={element} onSuccess={refreshData} />
                      ]}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Title level={5}>{element.element_name || element.element_id}</Title>
                      </div>
                      <Tag color="blue">{element.element_type}</Tag>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SchemePreview; 