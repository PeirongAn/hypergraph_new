import React from 'react';
import { Card, Descriptions, Tag, Divider } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface RuleDetailProps {
  rule: {
    id: string;
    name: string;
    weight: number;
    affected_element_types: string[];
    affected_element_keys: string[];
    description?: string;
    code?: string;
  };
}

const RuleDetail: React.FC<RuleDetailProps> = ({ rule }) => {
  return (
    <Card title={rule.name} bordered={false}>
      <Descriptions column={1}>
        <Descriptions.Item label="规则ID">{rule.id}</Descriptions.Item>
        {rule.description && (
          <Descriptions.Item label="描述">{rule.description}</Descriptions.Item>
        )}
        <Descriptions.Item label="权重">{rule.weight.toFixed(1)}</Descriptions.Item>
        <Descriptions.Item label="影响的要素类型">
          {rule.affected_element_types.map(type => (
            <Tag color="blue" key={type}>
              {type}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="使用的要素属性">
          {rule.affected_element_keys.map(key => (
            <Tag color="green" key={key}>
              {key}
            </Tag>
          ))}
        </Descriptions.Item>
        {rule.code && (
          <Descriptions.Item label="规则代码">
            <SyntaxHighlighter language="python" style={docco}>
              {rule.code}
            </SyntaxHighlighter>
          </Descriptions.Item>
        )}
      </Descriptions>
      
      <Divider />
      
      <p>
        <strong>说明：</strong> 规则用于评估要素是否满足特定条件，并计算要素的得分。
        权重决定了规则在整体评估中的重要性。规则代码定义了如何评估要素属性。
      </p>
    </Card>
  );
};

export default RuleDetail; 