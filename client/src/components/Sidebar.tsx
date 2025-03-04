import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ProjectOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 确定当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/schemes/preview')) return ['schemes-preview'];
    if (path.startsWith('/schemes')) return ['schemes'];
    if (path.startsWith('/elements')) return ['elements'];
    if (path.startsWith('/rules')) return ['rules'];
    if (path.startsWith('/settings')) return ['settings'];
    if (path.startsWith('/docs')) return ['docs'];
    return ['home'];
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={value => setCollapsed(value)}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        items={[
          {
            key: 'home',
            icon: <HomeOutlined />,
            label: '首页',
            onClick: () => navigate('/')
          },
          {
            key: 'elements',
            icon: <DatabaseOutlined />,
            label: '要素管理',
            onClick: () => navigate('/elements')
          },
          {
            key: 'rules',
            icon: <ApiOutlined />,
            label: '规则管理',
            onClick: () => navigate('/rules')
          },
          {
            key: 'schemes',
            icon: <ProjectOutlined />,
            label: '方案管理',
            onClick: () => navigate('/schemes')
          },
          {
            key: 'schemes-preview',
            icon: <AppstoreOutlined />,
            label: '方案预览',
            onClick: () => navigate('/schemes/preview')
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '系统设置',
            onClick: () => navigate('/settings')
          },
          {
            key: 'docs',
            icon: <FileTextOutlined />,
            label: '文档',
            onClick: () => navigate('/docs')
          }
        ]}
      />
    </Sider>
  );
};

export default Sidebar; 