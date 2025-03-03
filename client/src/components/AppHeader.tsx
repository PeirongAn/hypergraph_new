import React from 'react';
import { Layout, Typography, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  return (
    <Header className="flex justify-between items-center bg-white shadow-md px-6">
      <Link to="/">
        <Title level={3} className="m-0 text-blue-600">分层超图构建工具</Title>
      </Link>
      <Space>
        <Link to="/create">
          <Button type="primary" icon={<PlusOutlined />}>
            创建新超图
          </Button>
        </Link>
      </Space>
    </Header>
  );
};

export default AppHeader;