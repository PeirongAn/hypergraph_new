import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import { Button, Tooltip, Dropdown, Menu } from 'antd';
import { DownOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import SchemeLane from '../components/SchemeLane';
import RuleLane from '../components/RuleLane';
import ElementLane from '../components/ElementLane';
import ChatPanel from '../components/ChatPanel';
import HypergraphLegend from '../components/HypergraphLegend';

const DesignerLayout = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  gap: 16px;
  overflow: hidden;
  position: relative;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  overflow-y: auto;
`;

const Lane = styled.div<{ $layerType: 'entity' | 'rule' | 'solution' }>`
  background: ${props => {
    switch(props.$layerType) {
      case 'entity': return '#f0f5ff';
      case 'rule': return '#f6ffed';
      case 'solution': return '#fff7e6';
      default: return '#f5f5f5';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  
  &::before {
    content: '${props => {
      switch(props.$layerType) {
        case 'entity': return '要素层';
        case 'rule': return '规则层';
        case 'solution': return '方案层';
        default: return '';
      }
    }}';
    position: absolute;
    top: 8px;
    left: 16px;
    font-weight: bold;
    color: #666;
  }
`;

const LaneHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-top: 16px;
`;

const LaneTitle = styled.h3`
  margin: 0;
`;

const LaneControls = styled.div`
  display: flex;
  gap: 8px;
`;

const RightPanel = styled.div<{ $isMinimized: boolean }>`
  width: ${props => props.$isMinimized ? '0' : '25%'};
  transition: width 0.3s ease;
  overflow: hidden;
`;

const ToolbarContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 30%;
  z-index: 100;
  display: flex;
  gap: 8px;
`;

interface Dependency {
  from: string;
  to: string;
  color?: string;
  type: 'hard' | 'soft' | 'dynamic' | 'knowledge';
  label?: string;
  schemeId?: string; // 关联的方案ID
}

// 定义关联关系
interface NodeRelation {
  nodeId: string;
  relatedNodes: string[];
}

const SchemeDesigner: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'solution' | 'rule' | 'entity'>('all');
  const [activeSchemes, setActiveSchemes] = useState<string[]>([]);
  const [showConnections, setShowConnections] = useState(false); // 控制是否显示连线
  const [showRuleLane, setShowRuleLane] = useState(true);
  const [activeNodes, setActiveNodes] = useState<string[]>([]); // 当前高亮的节点
  const updateXarrow = useXarrow();

  // 所有可能的依赖关系
  const allDependencies: Dependency[] = [
    { 
      from: 'scheme-1-day1', 
      to: 'rule-1', 
      color: '#1890ff',
      type: 'hard',
      label: '必须满足',
      schemeId: 'scheme-1'
    },
    { 
      from: 'rule-1', 
      to: 'element-1', 
      color: '#1890ff',
      type: 'knowledge',
      label: '依赖于',
      schemeId: 'scheme-1'
    },
    {
      from: 'scheme-2-day1',
      to: 'rule-2',
      color: '#52c41a',
      type: 'soft',
      label: '优先满足',
      schemeId: 'scheme-2'
    },
    {
      from: 'rule-2',
      to: 'element-2',
      color: '#faad14',
      type: 'dynamic',
      label: '触发条件',
      schemeId: 'scheme-2'
    }
  ];
  
  // 节点关联关系定义
  const nodeRelations: NodeRelation[] = [
    {
      nodeId: 'scheme-1-day1',
      relatedNodes: ['rule-1', 'element-1']
    },
    {
      nodeId: 'scheme-2-day1',
      relatedNodes: ['rule-2', 'element-2']
    },
    {
      nodeId: 'rule-1',
      relatedNodes: ['scheme-1-day1', 'element-1']
    },
    {
      nodeId: 'rule-2',
      relatedNodes: ['scheme-2-day1', 'element-2']
    },
    {
      nodeId: 'element-1',
      relatedNodes: ['scheme-1-day1', 'rule-1']
    },
    {
      nodeId: 'element-2',
      relatedNodes: ['scheme-2-day1', 'rule-2']
    }
  ];
  
  // 根据激活的方案过滤依赖关系
  const visibleDependencies = showConnections 
    ? allDependencies.filter(dep => activeSchemes.includes(dep.schemeId || ''))
    : [];

  // 监听窗口大小变化，更新箭头位置
  useEffect(() => {
    const handleResize = () => {
      updateXarrow();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateXarrow]);

  // 当激活的方案或节点变化时，更新箭头
  useEffect(() => {
    const timer = setTimeout(() => {
      updateXarrow();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [activeSchemes, updateXarrow, showConnections, activeNodes]);

  const getArrowStyle = (type: Dependency['type']) => {
    switch(type) {
      case 'hard':
        return { strokeWidth: 2, dashness: false };
      case 'soft':
        return { strokeWidth: 1, dashness: true };
      case 'dynamic':
        return { strokeWidth: 2, dashness: { strokeLen: 10, nonStrokeLen: 10 } };
      case 'knowledge':
        return { strokeWidth: 1, dashness: { strokeLen: 5, nonStrokeLen: 5 } };
      default:
        return { strokeWidth: 1, dashness: false };
    }
  };

  const viewModeMenu = (
    <Menu
      onClick={({ key }) => setViewMode(key as any)}
      selectedKeys={[viewMode]}
      items={[
        { key: 'all', label: '显示全部层级' },
        { key: 'solution', label: '仅显示方案层' },
        { key: 'rule', label: '仅显示规则层' },
        { key: 'entity', label: '仅显示要素层' },
      ]}
    />
  );

  // 处理方案点击事件
  const handleSchemeClick = (schemeId: string) => {
    setActiveSchemes(prev => {
      // 如果方案已激活，则取消激活
      if (prev.includes(schemeId)) {
        const newActiveSchemes = prev.filter(id => id !== schemeId);
        // 如果没有激活的方案了，隐藏连线
        if (newActiveSchemes.length === 0) {
          setShowConnections(false);
          setActiveNodes([]);
        }
        return newActiveSchemes;
      } 
      // 否则激活方案并显示连线
      setShowConnections(true);
      return [...prev, schemeId];
    });
  };
  
  // 处理节点点击事件
  const handleNodeClick = (nodeId: string) => {
    // 查找该节点的关联节点
    const relation = nodeRelations.find(rel => rel.nodeId === nodeId);
    
    if (relation) {
      // 高亮该节点及其关联节点
      setActiveNodes([nodeId, ...relation.relatedNodes]);
      
      // 显示连线
      setShowConnections(true);
      
      // 如果节点属于某个方案，激活该方案
      const dependency = allDependencies.find(dep => dep.from === nodeId || dep.to === nodeId);
      if (dependency && dependency.schemeId) {
        setActiveSchemes(prev => 
          prev.includes(dependency.schemeId!) 
            ? prev 
            : [...prev, dependency.schemeId!]
        );
      }
      
      // 更新箭头
      updateXarrow();
    } else {
      // 如果没有找到关联关系，清除高亮
      setActiveNodes([]);
    }
  };

  // 检查元素是否存在
  const checkElementsExist = () => {
    console.log("检查元素是否存在:");
    allDependencies.forEach(dep => {
      const fromEl = document.getElementById(dep.from);
      const toEl = document.getElementById(dep.to);
      console.log(`${dep.from} -> ${dep.to}: `, fromEl ? "存在" : "不存在", toEl ? "存在" : "不存在");
    });
  };

  // 组件挂载后检查元素
  useEffect(() => {
    setTimeout(checkElementsExist, 1000);
  }, []);

  // 切换连线显示状态
  const toggleConnections = () => {
    setShowConnections(!showConnections);
    if (!showConnections) {
      // 如果要显示连线但没有激活的节点，清除高亮
      if (activeNodes.length === 0) {
        setActiveNodes([]);
      }
    }
  };

  // 切换规则视图
  const toggleRuleView = () => {
    setShowRuleLane(!showRuleLane);
  };
  
  // 判断节点是否高亮
  const isNodeActive = (nodeId: string) => {
    return activeNodes.includes(nodeId);
  };

  return (
    <DesignerLayout>
      <Xwrapper>
        {/* <ToolbarContainer>
          <Tooltip title="显示/隐藏图例">
            <Button 
              icon={<InfoCircleOutlined />} 
              onClick={() => setShowLegend(!showLegend)}
              type={showLegend ? "primary" : "default"}
            />
          </Tooltip>
          <Dropdown overlay={viewModeMenu}>
            <Button>
              视图模式 <DownOutlined />
            </Button>
          </Dropdown>
          <Tooltip title="超图设置">
            <Button icon={<SettingOutlined />} />
          </Tooltip>
          <Button 
            onClick={toggleConnections}
            type={showConnections ? "primary" : "default"}
          >
            {showConnections ? "隐藏连线" : "显示连线"}
          </Button>
        </ToolbarContainer>
         */}
        <LeftPanel>
          {(viewMode === 'all' || viewMode === 'solution') && (
            <Lane $layerType="solution">
              <LaneHeader>
               
              </LaneHeader>
              <SchemeLane 
                onSchemeClick={handleSchemeClick} 
                activeSchemes={activeSchemes} 
                onToggleRuleView={toggleRuleView}
                onNodeClick={handleNodeClick}
                activeNodes={activeNodes}
              />
            </Lane>
          )}
          
          {showRuleLane && (viewMode === 'all' || viewMode === 'rule') && (
            <Lane $layerType="rule">
              <LaneHeader>
                
              </LaneHeader>
              <RuleLane 
                onNodeClick={handleNodeClick}
                activeNodes={activeNodes}
              />
            </Lane>
          )}
          
          {(viewMode === 'all' || viewMode === 'entity') && (
            <Lane $layerType="entity">
              <LaneHeader>
                
              </LaneHeader>
              <ElementLane 
                onNodeClick={handleNodeClick}
                activeNodes={activeNodes}
              />
            </Lane>
          )}
          
          {visibleDependencies.map((dep, index) => (
            <Xarrow
              key={index}
              start={dep.from}
              end={dep.to}
              color={dep.color || "#1890ff"}
              {...getArrowStyle(dep.type)}
              path="smooth"
              startAnchor="auto"
              endAnchor="auto"
              showHead={true}
              headSize={6}
              curveness={0.3}
              zIndex={100}
              labels={{
                middle: <div style={{
                  background: 'white',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>{dep.label}</div>
              }}
            />
          ))}
        </LeftPanel>
        
        <RightPanel $isMinimized={isMinimized}>
          <ChatPanel onMinimize={setIsMinimized} />
        </RightPanel>
        
        {showLegend && <HypergraphLegend />}
      </Xwrapper>
    </DesignerLayout>
  );
};

export default SchemeDesigner; 