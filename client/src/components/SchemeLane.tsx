import React from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';
import SchemeCard, { SchemeFormData } from './SchemeCard';

const { Title } = Typography;

const LaneTitle = styled(Title)`
  &.ant-typography {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const SchemeLane: React.FC = () => {
  const handleSchemeChange = (id: string, values: SchemeFormData) => {
    console.log(`Scheme ${id} changed:`, values);
    // 这里处理方案数据变化
  };

  return (
    <div>
      <LaneTitle level={3}>方案层</LaneTitle>
      <SchemeCard
        id="scheme-1"
        title="Day1: 故宫+景山"
        status="error"
        initialValues={{
          startTime: '09:00',
          endTime: '17:00',
          attractions: ['故宫', '景山公园'],
          transportation: '步行',
          dining: '中餐'
        }}
        onChange={(values) => handleSchemeChange('scheme-1', values)}
      />
      <SchemeCard
        id="scheme-2"
        title="Day2: 颐和园游船"
        status="normal"
        initialValues={{
          startTime: '10:00',
          endTime: '16:00',
          attractions: ['颐和园'],
          transportation: '包车',
          dining: '自助餐'
        }}
        onChange={(values) => handleSchemeChange('scheme-2', values)}
      />
    </div>
  );
};

export default SchemeLane; 