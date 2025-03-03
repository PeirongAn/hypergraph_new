import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;

interface HypergraphFormData {
  name: string;
  description: string;
}

const CreateHypergraph: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: HypergraphFormData) => {
    try {
      setLoading(true);
      const result = await hypergraphApi.createHypergraph(values);
      message.success('超图创建成功');
      navigate(`/hypergraphs/${result.id}`);
    } catch (error) {
      console.error('创建超图失败:', error);
      message.error('创建超图失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-hypergraph">
      <Card>
        <div className="mb-4">
          <Link to="/hypergraphs">
            <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
          </Link>
        </div>
        
        <Title level={2}>创建新超图</Title>
        
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ description: '' }}
        >
          <Form.Item
            name="name"
            label="超图名称"
            rules={[{ required: true, message: '请输入超图名称' }]}
          >
            <Input placeholder="请输入超图名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="超图描述"
          >
            <TextArea rows={4} placeholder="请输入超图描述" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateHypergraph; 