import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Space, Card, Typography, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Option } = Select;

interface Rule {
  id: string;
  name: string;
  description: string;
}

interface RuleWeight {
  rule_id: string;
  weight: number;
}

interface RuleSelectorProps {
  onRulesSelected: (ruleWeights: Record<string, number>) => void;
  initialRuleWeights?: Record<string, number>;
}

const RuleSelector: React.FC<RuleSelectorProps> = ({ onRulesSelected, initialRuleWeights = {} }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRules, setSelectedRules] = useState<RuleWeight[]>([]);
  
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await hypergraphApi.getAllSharedRules();
        setRules(data);
        
        // 如果有初始规则权重，设置已选规则
        if (initialRuleWeights && Object.keys(initialRuleWeights).length > 0) {
          const initialSelected = Object.entries(initialRuleWeights).map(([rule_id, weight]) => ({
            rule_id,
            weight: Number(weight)
          }));
          setSelectedRules(initialSelected);
        } else if (selectedRules.length === 0) {
          // 如果没有初始规则且当前没有选择规则，添加一个空规则选择
          setSelectedRules([{ rule_id: '', weight: 1.0 }]);
        }
      } catch (error) {
        console.error('获取规则失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
    // 只在组件挂载时执行一次，不依赖于 initialRuleWeights
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const addRule = () => {
    // 添加一个新的空规则选择
    setSelectedRules([...selectedRules, { rule_id: '', weight: 1.0 }]);
  };
  
  const removeRule = (index: number) => {
    // 移除指定索引的规则
    const newSelectedRules = [...selectedRules];
    newSelectedRules.splice(index, 1);
    setSelectedRules(newSelectedRules);
    
    // 更新父组件
    updateParent(newSelectedRules);
  };
  
  const handleRuleChange = (value: string, index: number) => {
    // 更新规则ID
    const newSelectedRules = [...selectedRules];
    newSelectedRules[index].rule_id = value;
    setSelectedRules(newSelectedRules);
    
    // 更新父组件
    updateParent(newSelectedRules);
  };
  
  const handleWeightChange = (value: number | null, index: number) => {
    // 更新规则权重
    const newSelectedRules = [...selectedRules];
    newSelectedRules[index].weight = value || 1.0;
    setSelectedRules(newSelectedRules);
    
    // 更新父组件
    updateParent(newSelectedRules);
  };
  
  const debouncedUpdateParent = React.useCallback(
    debounce((ruleWeights: RuleWeight[]) => {
      // 将规则权重转换为对象格式并传递给父组件
      const ruleWeightsObj = ruleWeights.reduce((acc, { rule_id, weight }) => {
        if (rule_id) {
          acc[rule_id] = weight;
        }
        return acc;
      }, {} as Record<string, number>);
      
      onRulesSelected(ruleWeightsObj);
    }, 300),
    [onRulesSelected]
  );
  
  const updateParent = (ruleWeights: RuleWeight[]) => {
    debouncedUpdateParent(ruleWeights);
  };
  
  return (
    <Card>
      <Title level={4}>选择规则</Title>
      <Text>选择要包含在方案中的规则，并设置每个规则的权重</Text>
      
      <Divider />
      
      {selectedRules.map((rule, index) => (
        <Form.Item key={index} style={{ marginBottom: 16 }}>
          <Space align="baseline">
            <Select
              style={{ width: 300 }}
              placeholder="选择规则"
              value={rule.rule_id || undefined}
              onChange={(value) => handleRuleChange(value, index)}
              loading={loading}
            >
              {rules.map(r => (
                <Option key={r.id} value={r.id} disabled={selectedRules.some((sr, i) => i !== index && sr.rule_id === r.id)}>
                  {r.name} - {r.description}
                </Option>
              ))}
            </Select>
            
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              value={rule.weight}
              onChange={(value) => handleWeightChange(value, index)}
              placeholder="权重"
            />
            
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => removeRule(index)}
            />
          </Space>
        </Form.Item>
      ))}
      
      <Button 
        type="dashed" 
        onClick={addRule} 
        style={{ width: '100%' }} 
        icon={<PlusOutlined />}
      >
        添加规则
      </Button>
    </Card>
  );
};

export default RuleSelector; 