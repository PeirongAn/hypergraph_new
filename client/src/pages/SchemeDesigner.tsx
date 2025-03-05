import React, { useState } from 'react';
import styled from 'styled-components';
import Xarrow, { Xwrapper } from 'react-xarrows';
import SchemeLane from '../components/SchemeLane';
import RuleLane from '../components/RuleLane';
import ElementLane from '../components/ElementLane';
import ChatPanel from '../components/ChatPanel';

const DesignerLayout = styled.div`
  display: flex;
  height: calc(100vh - 120px);
  gap: 16px;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  overflow-y: auto;
`;

const Lane = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
`;

const RightPanel = styled.div<{ $isMinimized: boolean }>`
  width: ${props => props.$isMinimized ? '0' : '25%'};
  transition: width 0.3s ease;
  overflow: hidden;
`;

interface Dependency {
  from: string;
  to: string;
  color?: string;
}

const SchemeDesigner: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  // 定义依赖关系
  const dependencies: Dependency[] = [
    { from: 'scheme-1', to: 'rule-1', color: '#ff4d4f' }, // 故宫方案 -> 周一闭馆规则
    { from: 'rule-1', to: 'element-1', color: '#ff4d4f' }, // 周一闭馆规则 -> 故宫节点
    { from: 'scheme-2', to: 'rule-2' }, // 颐和园方案 -> 预算规则
    { from: 'scheme-1', to: 'rule-2' }, // 故宫方案 -> 预算规则
  ];

  return (
    <DesignerLayout>
      <Xwrapper>
        <LeftPanel>
          <Lane>
            <SchemeLane />
          </Lane>
          <Lane>
            <RuleLane />
          </Lane>
          <Lane>
            <ElementLane />
          </Lane>
          {dependencies.map((dep, index) => (
            <Xarrow
              key={index}
              start={dep.from}
              end={dep.to}
              color={dep.color || "#1890ff"}
              strokeWidth={2}
              path="straight"
              showHead={true}
              headSize={6}
              dashness={true}
            />
          ))}
        </LeftPanel>
        <RightPanel $isMinimized={isMinimized}>
          <ChatPanel onMinimize={setIsMinimized} />
        </RightPanel>
      </Xwrapper>
    </DesignerLayout>
  );
};

export default SchemeDesigner; 