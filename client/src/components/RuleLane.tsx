import React from 'react';
import { Card, Tag, Typography } from 'antd';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LaneTitle = styled(Title)`
  &.ant-typography {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

interface RuleLaneProps {
  onNodeClick: (nodeId: string) => void;
  activeNodes: string[];
}

const RuleCard = styled(Card)<{ $isActive: boolean }>`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.$isActive && `
    border: 2px solid #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
    background-color: #e6f7ff;
  `}
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const RuleLane: React.FC<RuleLaneProps> = ({ onNodeClick, activeNodes }) => {
  return (
    <div>
      {/* <LaneTitle level={3}>规则层</LaneTitle> */}
      <RuleCard 
        id="rule-1" 
        $isActive={activeNodes.includes('rule-1')}
        onClick={() => onNodeClick('rule-1')}
        size="small" 
        title="规则A: 周一闭馆"
      >
        <p><Text>条件: 周一</Text></p>
        <p><Text>动作: 排除故宫</Text></p>
      </RuleCard>
      <RuleCard 
        id="rule-2" 
        $isActive={activeNodes.includes('rule-2')}
        onClick={() => onNodeClick('rule-2')}
        size="small" 
        title="规则B: 预算≤6000"
      >
        <p><Text>当前总费用: 6500元</Text></p>
        <p><Tag color="error">⚠️ 超支</Tag></p>
      </RuleCard>
    </div>
  );
};

export default RuleLane; 