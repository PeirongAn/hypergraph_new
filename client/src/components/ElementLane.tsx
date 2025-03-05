import React from 'react';
import { Card, Typography } from 'antd';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LaneTitle = styled(Title)`
  &.ant-typography {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const ElementCard = styled(Card)`
  margin-bottom: 16px;
  position: relative;
`;

const ElementLane: React.FC = () => {
  return (
    <div>
      <LaneTitle level={3}>要素层</LaneTitle>
      <ElementCard id="element-1" size="small" title="故宫节点">
        <p><Text>门票: 60元</Text></p>
        <p><Text>开放时间: 8:30-17:00</Text></p>
      </ElementCard>
      <ElementCard id="element-2" size="small" title="包车服务节点">
        <p><Text>费用: 500元/天</Text></p>
        <p><Text>覆盖景点: 慕田峪</Text></p>
      </ElementCard>
    </div>
  );
};

export default ElementLane; 