import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Table, Tag, Descriptions, Divider, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import type { SortOrder } from 'antd/es/table/interface';

const { Title, Text } = Typography;

interface RuleWeight {
  rule_id: string;
  rule_name: string;
  weight: number;
  description: string;
}

interface SchemeRuleHyperedge {
  id: string;
  scheme_id: string;
  scheme_name: string;
  rules_count: number;
  rules: RuleWeight[];
}

const SchemeRuleHyperedgePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hyperedge, setHyperedge] = useState<SchemeRuleHyperedge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 获取所有超边
        const hyperedges = await hypergraphApi.getSchemeRuleHyperedges();
        
        // 找到当前超边
        const currentHyperedge = hyperedges.find((edge: SchemeRuleHyperedge) => edge.id === id);
        if (currentHyperedge) {
          setHyperedge(currentHyperedge);
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
      title: '规则ID',
      dataIndex: 'rule_id',
      key: 'rule_id',
    },
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      key: 'rule_name',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => weight.toFixed(2),
      sorter: (a: RuleWeight, b: RuleWeight) => a.weight - b.weight,
      defaultSortOrder: 'descend' as SortOrder,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
      <Link to="/scheme-rule-hyperedges">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          返回列表
        </Button>
      </Link>
      
      <Card>
        <Title level={3}>方案-规则超边: {hyperedge.scheme_name}</Title>
        
        <Descriptions bordered>
          <Descriptions.Item label="方案ID">{hyperedge.scheme_id}</Descriptions.Item>
          <Descriptions.Item label="方案名称">{hyperedge.scheme_name}</Descriptions.Item>
          <Descriptions.Item label="规则数量">{hyperedge.rules_count}</Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <Title level={4}>规则列表</Title>
        
        <Table 
          columns={columns} 
          dataSource={hyperedge.rules} 
          rowKey="rule_id" 
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default SchemeRuleHyperedgePage; 