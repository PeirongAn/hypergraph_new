import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { hypergraphApi } from '../services/api';
import RuleSelector from '../components/RuleSelector';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SchemeGenerator: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [ruleWeights, setRuleWeights] = useState<Record<string, number>>({});
  
  const handleRulesSelected = (selectedRuleWeights: Record<string, number>) => {
    setRuleWeights(selectedRuleWeights);
  };
  
  const handleSubmit = async (values: any) => {
    // 确保至少选择了一个规则
    if (Object.keys(ruleWeights).length === 0) {
      message.warning('请至少选择一个规则');
      return;
    }
    
    setLoading(true);
    
    try {
      // 创建方案数据
      const schemeData = {
        name: values.name,
        description: values.description || '',
        rule_weights: ruleWeights
      };
      
      // 调用API创建方案
      const response = await hypergraphApi.createScheme(schemeData);
      
      message.success('方案创建成功');
      
      // 导航到方案预览页面，并传递方案数据
      navigate('/schemes/preview', { state: { schemeData: response } });
    } catch (error) {
      console.error('创建方案失败:', error);
      message.error('创建方案失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Card>
        <Title level={3}>基于规则生成方案</Title>
        <Text>选择规则并设置权重，快速创建新方案</Text>
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="方案名称"
            rules={[{ required: true, message: '请输入方案名称' }]}
          >
            <Input placeholder="输入方案名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="方案描述"
          >
            <TextArea rows={4} placeholder="输入方案描述（可选）" />
          </Form.Item>
          
          <Divider />
          
          <RuleSelector onRulesSelected={handleRulesSelected} />
          
          <Divider />
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              生成方案
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SchemeGenerator; 