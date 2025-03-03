import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Tabs, Typography, Button, Table, Descriptions, Tag, Spin, message } from 'antd';
import { ArrowLeftOutlined, ExperimentOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Hypergraph {
  id: string;
  name: string;
  description: string;
  elements_count: number;
  rules_count: number;
  schemes_count: number;
  element_types: string[];
}

interface Element {
  id: string;
  type: string;
  attributes: Record<string, any>;
  score: number;
  rule_scores: Record<string, number>;
}

interface Rule {
  id: string;
  name: string;
  weight: number;
  affected_element_types: string[];
}

interface Scheme {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
  score: number;
  selected_elements_count: number;
}

const HypergraphDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hypergraph, setHypergraph] = useState<Hypergraph | null>(null);
  const [elements, setElements] = useState<Record<string, Element[]>>({});
  const [rules, setRules] = useState<Rule[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 获取超图基本信息
        const hypergraphData = await hypergraphApi.getHypergraphById(id);
        setHypergraph(hypergraphData);
        
        // 获取所有共享要素
        const elementsData = await hypergraphApi.getAllSharedElements();
        setElements(elementsData);
        
        // 获取所有共享规则
        const rulesData = await hypergraphApi.getAllSharedRules();
        setRules(rulesData);
        
        // 获取超图的所有方案
        const schemesData = await hypergraphApi.getAllSchemes(id);
        setSchemes(schemesData);
      } catch (error) {
        console.error('获取超图详情失败:', error);
        message.error('获取超图详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!hypergraph) {
    return (
      <div className="text-center p-8">
        <Title level={3}>未找到超图</Title>
        <Link to="/hypergraphs">
          <Button type="primary">返回超图列表</Button>
        </Link>
      </div>
    );
  }

  // 渲染要素表格
  const renderElementTables = () => {
    return Object.entries(elements).map(([type, typeElements]) => {
      // 动态生成列
      const allKeys = new Set<string>();
      typeElements.forEach(element => {
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
          title: '评分',
          dataIndex: 'score',
          key: 'score',
          width: 100,
        },
      ];
      
      return (
        <div key={type} className="mb-6">
          <Title level={4}>{type}</Title>
          <Table
            columns={columns}
            dataSource={typeElements}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </div>
      );
    });
  };

  // 渲染规则表格
  const renderRulesTable = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '权重',
        dataIndex: 'weight',
        key: 'weight',
      },
      {
        title: '影响的要素类型',
        dataIndex: 'affected_element_types',
        key: 'affected_element_types',
        render: (types: string[]) => types.map(type => <Tag key={type}>{type}</Tag>),
      },
    ];
    
    return (
      <Table
        columns={columns}
        dataSource={rules}
        rowKey="id"
        pagination={false}
      />
    );
  };

  // 渲染方案表格
  const renderSchemesTable = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '规则数量',
        dataIndex: 'rules',
        key: 'rules_count',
        render: (rules: Rule[]) => rules.length,
      },
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: Scheme) => (
          <Link to={`/hypergraphs/${id}/schemes/${record.id}/evaluate`}>
            <Button type="primary" icon={<ExperimentOutlined />} size="small">
              评估
            </Button>
          </Link>
        ),
      },
    ];
    
    return (
      <Table
        columns={columns}
        dataSource={schemes}
        rowKey="id"
        pagination={false}
      />
    );
  };

  return (
    <div className="hypergraph-detail">
      <Card>
        <div className="mb-4">
          <Link to="/hypergraphs">
            <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
          </Link>
        </div>
        
        <Title level={2}>{hypergraph.name}</Title>
        <Paragraph>{hypergraph.description}</Paragraph>
        
        <Descriptions bordered className="mb-6">
          <Descriptions.Item label="要素数量">{hypergraph.elements_count}</Descriptions.Item>
          <Descriptions.Item label="规则数量">{hypergraph.rules_count}</Descriptions.Item>
          <Descriptions.Item label="方案数量">{hypergraph.schemes_count}</Descriptions.Item>
          <Descriptions.Item label="要素类型">
            {hypergraph.element_types.map(type => (
              <Tag key={type}>{type}</Tag>
            ))}
          </Descriptions.Item>
        </Descriptions>
        
        <Tabs defaultActiveKey="elements">
          <TabPane tab="要素" key="elements">
            {renderElementTables()}
          </TabPane>
          <TabPane tab="规则" key="rules">
            {renderRulesTable()}
          </TabPane>
          <TabPane tab="方案" key="schemes">
            {renderSchemesTable()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default HypergraphDetail; 