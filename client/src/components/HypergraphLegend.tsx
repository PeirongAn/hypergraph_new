import React from 'react';
import styled from 'styled-components';

const LegendContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const LegendTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
`;

const LegendLine = styled.div<{ 
  $color: string; 
  $strokeWidth: number; 
  $dashArray?: string;
}>`
  width: 24px;
  height: 0;
  border-top: ${props => `${props.$strokeWidth}px`} ${props => props.$dashArray ? 'dashed' : 'solid'} ${props => props.$color};
  margin-right: 8px;
  ${props => props.$dashArray && `border-style: dashed;`}
`;

const LegendText = styled.span`
  color: #333;
`;

const HypergraphLegend: React.FC = () => {
  return (
    <LegendContainer>
      <LegendTitle>连接线图例</LegendTitle>
      <LegendItem>
        <LegendLine $color="#ff4d4f" $strokeWidth={2} />
        <LegendText>硬约束关系</LegendText>
      </LegendItem>
      <LegendItem>
        <LegendLine $color="#52c41a" $strokeWidth={1} $dashArray="5,5" />
        <LegendText>软约束关系</LegendText>
      </LegendItem>
      <LegendItem>
        <LegendLine $color="#faad14" $strokeWidth={2} $dashArray="10,10" />
        <LegendText>动态触发关系</LegendText>
      </LegendItem>
      <LegendItem>
        <LegendLine $color="#1890ff" $strokeWidth={1} $dashArray="5,5" />
        <LegendText>知识关联关系</LegendText>
      </LegendItem>
    </LegendContainer>
  );
};

export default HypergraphLegend; 