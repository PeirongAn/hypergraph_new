import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Table, Tag, Descriptions, Divider, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import type { SortOrder } from 'antd/es/table/interface';

const { Title, Text } = Typography;

interface ElementScore {
  element_id: string;
  element_name: string;
  element_type: string;
  score: number;
}

interface RuleElementHyperedge {
  id: string;
  rule_id: string;
  rule_name: string;
  elements_count: number;
  elements: ElementScore[];
  total_score: number;
}

const RuleElementHyperedgePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hyperedge, setHyperedge] = useState<RuleElementHyperedge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rule, setRule] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取所有超边
        const hyperedges = await hypergraphApi.getRuleElementHyperedges();
        
        // 找到当前超边
        const currentHyperedge = hyperedges.find((edge: RuleElementHyperedge) => edge.id === id);
        if (currentHyperedge) {
          setHyperedge(currentHyperedge);
          
          // 获取规则详情
          const rules = await hypergraphApi.getAllSharedRules();
          const currentRule = rules.find((r: any) => r.id === currentHyperedge.rule_id);
          if (currentRule) {
            setRule(currentRule);
          }
        }
      } catch (error) {
        console.error('获取超边详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);
  
  const columns = [
    {
      title: '要素ID',
      dataIndex: 'element_id',
      key: 'element_id',
    },
    {
      title: '要素名称',
      dataIndex: 'element_name',
      key: 'element_name',
    },
    {
      title: '要素类型',
      dataIndex: 'element_type',
      key: 'element_type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => score.toFixed(2),
      sorter: (a: ElementScore, b: ElementScore) => a.score - b.score,
      defaultSortOrder: 'descend' as SortOrder,
    },
  ];
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!hyperedge) {
    return <div>未找到超边</div>;
  }
  
  return (
    <div>
      <Link to="/rule-element-hyperedges">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          返回列表
        </Button>
      </Link>
      
      <Card>
        <Title level={3}>规则-要素超边: {hyperedge.rule_name}</Title>
        
        {rule && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="规则ID">{rule.id}</Descriptions.Item>
            <Descriptions.Item label="规则名称">{rule.name}</Descriptions.Item>
            <Descriptions.Item label="权重">{rule.weight}</Descriptions.Item>
            <Descriptions.Item label="影响的要素类型">
              {rule.affected_element_types.map((type: string) => (
                <Tag color="blue" key={type}>{type}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="使用的属性" span={2}>
              {rule.affected_element_keys.map((key: string) => (
                <Tag color="green" key={key}>{key}</Tag>
              ))}
            </Descriptions.Item>
            {rule.description && (
              <Descriptions.Item label="描述" span={2}>
                {rule.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>满足规则的要素: </Text>
          <Text>{hyperedge.elements_count} 个</Text>
          <Text strong style={{ marginLeft: 24 }}>总得分: </Text>
          <Text>{hyperedge.total_score.toFixed(2)}</Text>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={hyperedge.elements} 
          rowKey="element_id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default RuleElementHyperedgePage; 