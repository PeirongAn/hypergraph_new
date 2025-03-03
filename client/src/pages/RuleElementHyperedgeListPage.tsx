import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Button, Tag, Space, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title } = Typography;

interface RuleElementHyperedge {
  id: string;
  rule_id: string;
  rule_name: string;
  elements_count: number;
  elements: Array<{
    element_id: string;
    element_name: string;
    element_type: string;
    score: number;
  }>;
  total_score: number;
}

const RuleElementHyperedgeListPage: React.FC = () => {
  const [hyperedges, setHyperedges] = useState<RuleElementHyperedge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchHyperedges = async () => {
      setLoading(true);
      try {
        const data = await hypergraphApi.getRuleElementHyperedges();
        setHyperedges(data);
      } catch (error) {
        console.error('获取规则超边失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHyperedges();
  }, []);
  
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      key: 'rule_name',
      render: (text: string, record: RuleElementHyperedge) => (
        <Link to={`/rule-element-hyperedges/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '要素数量',
      dataIndex: 'elements_count',
      key: 'elements_count',
      sorter: (a: RuleElementHyperedge, b: RuleElementHyperedge) => 
        a.elements_count - b.elements_count,
    },
    {
      title: '总得分',
      dataIndex: 'total_score',
      key: 'total_score',
      render: (score: number) => score.toFixed(2),
      sorter: (a: RuleElementHyperedge, b: RuleElementHyperedge) => 
        a.total_score - b.total_score,
    },
    {
      title: '要素类型分布',
      key: 'element_types',
      render: (text: string, record: RuleElementHyperedge) => {
        // 计算每种类型的要素数量
        const typeCounts: Record<string, number> = {};
        record.elements.forEach(element => {
          typeCounts[element.element_type] = (typeCounts[element.element_type] || 0) + 1;
        });
        
        return (
          <>
            {Object.entries(typeCounts).map(([type, count]) => (
              <Tag color="blue" key={type}>
                {type}: {count}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: RuleElementHyperedge) => (
        <Space size="middle">
          <Link to={`/rule-element-hyperedges/${record.id}`}>
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
        <Title level={3}>规则-要素超边</Title>
        <p>每个超边表示一个规则与满足该规则的所有要素之间的关系</p>
        
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

export default RuleElementHyperedgeListPage; 