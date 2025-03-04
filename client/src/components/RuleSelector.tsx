import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Space, Card, Typography, Divider, Input, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Rule {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

interface RuleConfig {
  rule_id: string;
  weight: number;
  parameters: Record<string, any>;
}

interface RuleSelectorProps {
  onRulesSelected: (ruleConfigs: Record<string, any>) => void;
  initialRuleConfigs?: Record<string, any>;
}

const RuleSelector: React.FC<RuleSelectorProps> = ({ onRulesSelected, initialRuleConfigs = {} }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRules, setSelectedRules] = useState<RuleConfig[]>([]);
  
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await hypergraphApi.getAllSharedRules();
        setRules(data);
        
        // 如果有初始规则配置，设置已选规则
        if (initialRuleConfigs && Object.keys(initialRuleConfigs).length > 0) {
          const initialSelected = Object.entries(initialRuleConfigs).map(([rule_id, config]) => {
            // 处理两种可能的格式：简单的数字权重或包含权重和参数的对象
            if (typeof config === 'number') {
              return {
                rule_id,
                weight: config,
                parameters: {}
              };
            } else {
              return {
                rule_id,
                weight: (config as any).weight || 1.0,
                parameters: (config as any).parameters || {}
              };
            }
          });
          setSelectedRules(initialSelected);
        } else if (selectedRules.length === 0) {
          // 如果没有初始规则且当前没有选择规则，添加一个空规则选择
          setSelectedRules([{ rule_id: '', weight: 1.0, parameters: {} }]);
        }
      } catch (error) {
        console.error('获取规则失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const addRule = () => {
    // 添加一个新的空规则选择
    setSelectedRules([...selectedRules, { rule_id: '', weight: 1.0, parameters: {} }]);
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
    
    // 找到选中的规则，获取其默认参数
    const selectedRule = rules.find(r => r.id === value);
    if (selectedRule && selectedRule.parameters) {
      // 使用规则的默认参数
      newSelectedRules[index].parameters = { ...selectedRule.parameters };
    } else {
      // 如果规则没有参数，使用空对象
      newSelectedRules[index].parameters = {};
    }
    
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
  
  const handleParameterChange = (index: number, paramName: string, value: any) => {
    // 更新规则参数
    const newSelectedRules = [...selectedRules];
    newSelectedRules[index].parameters = {
      ...newSelectedRules[index].parameters,
      [paramName]: value
    };
    setSelectedRules(newSelectedRules);
    
    // 更新父组件
    updateParent(newSelectedRules);
  };
  
  const debouncedUpdateParent = React.useCallback(
    debounce((ruleConfigs: RuleConfig[]) => {
      // 将规则配置转换为对象格式并传递给父组件
      const ruleConfigsObj = ruleConfigs.reduce((acc, { rule_id, weight, parameters }) => {
        if (rule_id) {
          acc[rule_id] = {
            weight,
            parameters
          };
        }
        return acc;
      }, {} as Record<string, any>);
      
      onRulesSelected(ruleConfigsObj);
    }, 300),
    [onRulesSelected]
  );
  
  const updateParent = (ruleConfigs: RuleConfig[]) => {
    debouncedUpdateParent(ruleConfigs);
  };
  
  // 渲染规则参数编辑表单
  const renderParameterForm = (rule: Rule, ruleIndex: number) => {
    if (!rule || !rule.parameters || Object.keys(rule.parameters).length === 0) {
      return null;
    }
    
    const selectedRuleConfig = selectedRules[ruleIndex];
    
    return (
      <div className="mt-3">
        <Divider orientation="left">参数设置</Divider>
        <Form layout="vertical">
          {Object.entries(rule.parameters).map(([paramName, defaultValue]) => {
            const currentValue = selectedRuleConfig.parameters[paramName] !== undefined 
              ? selectedRuleConfig.parameters[paramName] 
              : defaultValue;
            
            // 根据参数类型渲染不同的输入控件
            if (typeof defaultValue === 'number') {
              return (
                <Form.Item key={paramName} label={paramName}>
                  <InputNumber
                    value={currentValue}
                    onChange={(value) => handleParameterChange(ruleIndex, paramName, value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              );
            } else if (typeof defaultValue === 'string') {
              return (
                <Form.Item key={paramName} label={paramName}>
                  <Input
                    value={currentValue}
                    onChange={(e) => handleParameterChange(ruleIndex, paramName, e.target.value)}
                  />
                </Form.Item>
              );
            } else if (Array.isArray(defaultValue)) {
              // 如果是数组，提供选择框
              return (
                <Form.Item key={paramName} label={paramName}>
                  <Select
                    value={currentValue}
                    onChange={(value) => handleParameterChange(ruleIndex, paramName, value)}
                    style={{ width: '100%' }}
                  >
                    {defaultValue.map((item) => (
                      <Option key={item} value={item}>{item}</Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }
            
            return null;
          })}
        </Form>
      </div>
    );
  };
  
  return (
    <Card>
      <Title level={4}>选择规则</Title>
      <Text>选择要包含在方案中的规则，设置每个规则的权重和参数</Text>
      
      <Divider />
      
      {selectedRules.map((ruleConfig, index) => {
        const selectedRule = rules.find(r => r.id === ruleConfig.rule_id);
        
        return (
          <div key={index} style={{ marginBottom: 16 }}>
            <Space align="start" style={{ width: '100%' }}>
              <div style={{ flex: 1 }}>
                <Select
                  style={{ width: '100%', marginBottom: 8 }}
                  placeholder="选择规则"
                  value={ruleConfig.rule_id || undefined}
                  onChange={(value) => handleRuleChange(value, index)}
                  loading={loading}
                >
                  {rules.map(r => (
                    <Option 
                      key={r.id} 
                      value={r.id} 
                      disabled={selectedRules.some((sr, i) => i !== index && sr.rule_id === r.id)}
                    >
                      {r.name} - {r.description}
                    </Option>
                  ))}
                </Select>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ marginRight: 8 }}>权重:</Text>
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    value={ruleConfig.weight}
                    onChange={(value) => handleWeightChange(value, index)}
                    style={{ width: 120 }}
                  />
                  
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => removeRule(index)}
                    style={{ marginLeft: 'auto' }}
                  />
                </div>
                
                {selectedRule && selectedRule.parameters && Object.keys(selectedRule.parameters).length > 0 && (
                  <Collapse ghost>
                    <Panel 
                      header={<span><SettingOutlined /> 参数设置</span>} 
                      key="parameters"
                    >
                      {renderParameterForm(selectedRule, index)}
                    </Panel>
                  </Collapse>
                )}
              </div>
            </Space>
            
            <Divider style={{ margin: '8px 0' }} />
          </div>
        );
      })}
      
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