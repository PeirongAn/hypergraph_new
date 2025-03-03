import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Typography, Button, Table, Descriptions, Tag, Spin, message, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title, Paragraph } = Typography;

interface EvaluationResult {
  scheme_id: string;
  scheme_name: string;
  scheme_description: string;
  scheme_score: number;
  selected_elements: Element[];
}

interface Element {
  id: string;
  type: string;
  attributes: Record<string, any>;
  score: number;
  rule_scores: Record<string, number>;
}

const SchemeEvaluation: React.FC = () => {
  const { hypergraphId, schemeId } = useParams<{ hypergraphId: string; schemeId: string }>();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!hypergraphId || !schemeId) return;
      
      try {
        setLoading(true);
        const data = await hypergraphApi.evaluateScheme(hypergraphId, schemeId);
        setResult(data);
      } catch (error) {
        console.error('评估方案失败:', error);
        message.error('评估方案失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [hypergraphId, schemeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="评估中..." />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center p-8">
        <Title level={3}>未找到评估结果</Title>
        <Link to={`/hypergraphs/${hypergraphId}`}>
          <Button type="primary">返回超图详情</Button>
        </Link>
      </div>
    );
  }

  // 按类型分组元素
  const elementsByType: Record<string, Element[]> = {};
  result.selected_elements.forEach(element => {
    if (!elementsByType[element.type]) {
      elementsByType[element.type] = [];
    }
    elementsByType[element.type].push(element);
  });

  // 渲染元素表格
  const renderElementTables = () => {
    return Object.entries(elementsByType).map(([type, elements]) => {
      // 动态生成列
      const allKeys = new Set<string>();
      elements.forEach(element => {
        Object.keys(element.attributes).forEach(key => allKeys.add(key));
      });
      
      const columns = [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 100,
        },
        ...Array.from(allKeys).map(key => ({
          title: key,
          dataIndex: ['attributes', key],
          key,
          render: (value: any) => {
            if (Array.isArray(value)) {
              return value.map(v => <Tag key={v}>{v}</Tag>);
            }
            return value;
          },
        })),
        {
          title: '总得分',
          dataIndex: 'score',
          key: 'score',
          width: 100,
          sorter: (a: Element, b: Element) => a.score - b.score,
          defaultSortOrder: 'descend',
        },
        {
          title: '规则得分',
          dataIndex: 'rule_scores',
          key: 'rule_scores',
          render: (scores: Record<string, number>) => (
            <div>
              {Object.entries(scores).map(([ruleId, score]) => (
                <div key={ruleId}>
                  {ruleId}: {score.toFixed(2)}
                </div>
              ))}
            </div>
          ),
        },
      ];
      
      return (
        <div key={type} className="mb-6">
          <Title level={4}>{type}</Title>
          <Table
            columns={columns}
            dataSource={elements}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      );
    });
  };

  return (
    <div className="scheme-evaluation">
      <Card>
        <div className="mb-4">
          <Link to={`/hypergraphs/${hypergraphId}`}>
            <Button icon={<ArrowLeftOutlined />}>返回超图详情</Button>
          </Link>
        </div>
        
        <Title level={2}>方案评估: {result.scheme_name}</Title>
        <Paragraph>{result.scheme_description}</Paragraph>
        
        <Descriptions bordered className="mb-6">
          <Descriptions.Item label="方案得分">{result.scheme_score.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="选中要素数量">{result.selected_elements.length}</Descriptions.Item>
        </Descriptions>
        
        <Divider orientation="left">选中的要素</Divider>
        {renderElementTables()}
      </Card>
    </div>
  );
};

export default SchemeEvaluation; 