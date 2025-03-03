import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Typography, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title } = Typography;

interface Hypergraph {
  id: string;
  name: string;
  description: string;
  elements_count: number;
  rules_count: number;
  schemes_count: number;
  element_types: string[];
}

const HypergraphList: React.FC = () => {
  const [hypergraphs, setHypergraphs] = useState<Hypergraph[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHypergraphs = async () => {
    try {
      setLoading(true);
      const data = await hypergraphApi.getAllHypergraphs();
      setHypergraphs(data);
    } catch (error) {
      console.error('获取超图列表失败:', error);
      message.error('获取超图列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHypergraphs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await hypergraphApi.deleteHypergraph(id);
      message.success('超图删除成功');
      fetchHypergraphs();
    } catch (error) {
      console.error('删除超图失败:', error);
      message.error('删除超图失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Hypergraph) => (
        <Link to={`/hypergraphs/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '要素数量',
      dataIndex: 'elements_count',
      key: 'elements_count',
    },
    {
      title: '规则数量',
      dataIndex: 'rules_count',
      key: 'rules_count',
    },
    {
      title: '方案数量',
      dataIndex: 'schemes_count',
      key: 'schemes_count',
    },
    {
      title: '要素类型',
      dataIndex: 'element_types',
      key: 'element_types',
      render: (types: string[]) => types.join(', '),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Hypergraph) => (
        <Space size="middle">
          <Link to={`/hypergraphs/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />} size="small">
              查看
            </Button>
          </Link>
          <Link to={`/hypergraphs/${record.id}/edit`}>
            <Button icon={<EditOutlined />} size="small">
              编辑
            </Button>
          </Link>
          <Popconfirm
            title="确定要删除这个超图吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="hypergraph-list">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>超图列表</Title>
          <Link to="/create">
            <Button type="primary" icon={<PlusOutlined />}>
              创建新超图
            </Button>
          </Link>
        </div>
        <Table
          columns={columns}
          dataSource={hypergraphs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default HypergraphList; 