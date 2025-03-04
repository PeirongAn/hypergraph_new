import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button, Tag, Space } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title } = Typography;

interface SchemeRuleHyperedge {
  id: string;
  scheme_id: string;
  scheme_name: string;
  rules_count: number;
  rules: Array<{
    rule_id: string;
    rule_name: string;
    weight: number;
    description: string;
  }>;
}

const SchemeRuleHyperedgeListPage: React.FC = () => {
  const [hyperedges, setHyperedges] = useState<SchemeRuleHyperedge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchHyperedges = async () => {
      setLoading(true);
      try {
        const data = await hypergraphApi.getSchemeRuleHyperedges();
        setHyperedges(data);
      } catch (error) {
        console.error('获取方案规则超边失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHyperedges();
  }, []);
  
  const columns = [
    {
      title: '方案名称',
      dataIndex: 'scheme_name',
      key: 'scheme_name',
      render: (text: string, record: SchemeRuleHyperedge) => (
        <Link to={`/scheme-rule-hyperedges/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '规则数量',
      dataIndex: 'rules_count',
      key: 'rules_count',
      sorter: (a: SchemeRuleHyperedge, b: SchemeRuleHyperedge) => 
        a.rules_count - b.rules_count,
    },
    {
      title: '规则列表',
      key: 'rules',
      render: (text: string, record: SchemeRuleHyperedge) => (
        <>
          {record.rules.map(rule => (
            <Tag color="blue" key={rule.rule_id}>
              {rule.rule_name} (权重: {rule.weight})
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: SchemeRuleHyperedge) => (
        <Space size="middle">
          <Link to={`/scheme-rule-hyperedges/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              查看详情
            </Button>
          </Link>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Card>
        <Title level={3}>方案-规则超边</Title>
        <p>每个超边表示一个方案与其使用的所有规则之间的关系</p>
        
        <Table 
          columns={columns} 
          dataSource={hyperedges} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default SchemeRuleHyperedgeListPage; 