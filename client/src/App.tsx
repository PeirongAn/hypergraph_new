import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import HypergraphList from './pages/HypergraphList';
import HypergraphDetail from './pages/HypergraphDetail';
import SchemeEvaluation from './pages/SchemeEvaluation';
import CreateHypergraph from './pages/CreateHypergraph';
import ElementsManagement from './pages/ElementsManagement';
import RulesManagement from './pages/RulesManagement';
import RuleElementHyperedgeListPage from './pages/RuleElementHyperedgeListPage';
import RuleElementHyperedgePage from './pages/RuleElementHyperedgePage';
import './App.css';

const { Content } = Layout;

// 临时页面组件
const Dashboard = () => <div>仪表盘页面</div>;
const Settings = () => <div>设置页面</div>;

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <AppSidebar />
          <Layout style={{ padding: '16px', overflow: 'auto' }}>
            <Content style={{ background: '#fff', padding: '24px', borderRadius: '8px', height: '100%' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/hypergraphs" element={<HypergraphList />} />
                <Route path="/hypergraphs/:id" element={<HypergraphDetail />} />
                <Route path="/hypergraphs/:hypergraphId/schemes/:schemeId/evaluate" element={<SchemeEvaluation />} />
                <Route path="/create" element={<CreateHypergraph />} />
                <Route path="/elements" element={<ElementsManagement />} />
                <Route path="/rules" element={<RulesManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/rule-element-hyperedges" element={<RuleElementHyperedgeListPage />} />
                <Route path="/rule-element-hyperedges/:id" element={<RuleElementHyperedgePage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
