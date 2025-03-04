import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  AppstoreOutlined, 
  PlusOutlined, 
  SettingOutlined,
  DatabaseOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <Sider width={200} className="site-layout-background" collapsible>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="/" icon={<DashboardOutlined />}>
          <Link to="/">仪表盘</Link>
        </Menu.Item>
        <Menu.Item key="/hypergraphs" icon={<AppstoreOutlined />}>
          <Link to="/hypergraphs">超图列表</Link>
        </Menu.Item>
        <Menu.Item key="/create" icon={<PlusOutlined />}>
          <Link to="/create">创建超图</Link>
        </Menu.Item>
        <Menu.Item key="/elements" icon={<DatabaseOutlined />}>
          <Link to="/elements">要素管理</Link>
        </Menu.Item>
        <Menu.Item key="/rules" icon={<ApartmentOutlined />}>
          <Link to="/rules">规则管理</Link>
        </Menu.Item>
        <Menu.Item key="/settings" icon={<SettingOutlined />}>
          <Link to="/settings">设置</Link>
        </Menu.Item>
        <Menu.Item key="/rule-element-hyperedges" icon={<NodeIndexOutlined />}>
          <Link to="/rule-element-hyperedges">规则-要素关系</Link>
        </Menu.Item>
        <Menu.Item key="scheme-rule-hyperedges" icon={<ApartmentOutlined />}>
          <Link to="/scheme-rule-hyperedges">方案-规则关系</Link>
        </Menu.Item>
        <Menu.Item key="scheme-generator" icon={<ExperimentOutlined />}>
          <Link to="/scheme-generator">方案生成器</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AppSidebar;