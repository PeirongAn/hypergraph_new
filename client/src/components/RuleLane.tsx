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

const RuleCard = styled(Card)`
  margin-bottom: 16px;
  position: relative;
`;

const RuleLane: React.FC = () => {
  return (
    <div>
      <LaneTitle level={3}>规则层</LaneTitle>
      <RuleCard id="rule-1" size="small" title="规则A: 周一闭馆">
        <p><Text>条件: 周一</Text></p>
        <p><Text>动作: 排除故宫</Text></p>
      </RuleCard>
      <RuleCard id="rule-2" size="small" title="规则B: 预算≤6000">
        <p><Text>当前总费用: 6500元</Text></p>
        <p><Tag color="error">⚠️ 超支</Tag></p>
      </RuleCard>
    </div>
  );
};

export default RuleLane; 