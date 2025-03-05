import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import styled from 'styled-components';
import { ClockCircleOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LaneTitle = styled(Title)`
  &.ant-typography {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

interface ElementLaneProps {
  onNodeClick: (nodeId: string) => void;
  activeNodes: string[];
}

const ElementCard = styled(Card)<{ $isActive: boolean }>`
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

const ElementInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ElementLane: React.FC<ElementLaneProps> = ({ onNodeClick, activeNodes }) => {
  return (
    <div>
      {/* <LaneTitle level={3}>要素层</LaneTitle> */}
      
      <ElementCard 
        id="element-1" 
        $isActive={activeNodes.includes('element-1')}
        onClick={() => onNodeClick('element-1')}
        size="small" 
        title="故宫"
      >
        <ElementInfo>
          <EnvironmentOutlined />
          <Text>北京市东城区景山前街4号</Text>
        </ElementInfo>
        <ElementInfo>
          <ClockCircleOutlined />
          <Text>开放时间: 8:30-17:00 (周一闭馆)</Text>
        </ElementInfo>
        <ElementInfo>
          <DollarOutlined />
          <Text>门票: ¥60/人</Text>
        </ElementInfo>
        <Space style={{ marginTop: 8 }}>
          <Tag color="blue">文化遗产</Tag>
          <Tag color="green">热门景点</Tag>
        </Space>
      </ElementCard>
      
      <ElementCard 
        id="element-2" 
        $isActive={activeNodes.includes('element-2')}
        onClick={() => onNodeClick('element-2')}
        size="small" 
        title="颐和园"
      >
        <ElementInfo>
          <EnvironmentOutlined />
          <Text>北京市海淀区新建宫门路19号</Text>
        </ElementInfo>
        <ElementInfo>
          <ClockCircleOutlined />
          <Text>开放时间: 6:30-18:00</Text>
        </ElementInfo>
        <ElementInfo>
          <DollarOutlined />
          <Text>门票: ¥30/人</Text>
        </ElementInfo>
        <Space style={{ marginTop: 8 }}>
          <Tag color="blue">园林景观</Tag>
          <Tag color="green">自然风光</Tag>
        </Space>
      </ElementCard>
    </div>
  );
};

export default ElementLane; 