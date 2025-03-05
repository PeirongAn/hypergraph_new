import React, { useState, useEffect } from 'react';
import { Button, Popconfirm, Modal, Form, Input, message, Tabs, Table, InputNumber, Select, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import { debounce } from 'lodash';

interface SchemeActionsProps {
  scheme: any;
  onSuccess: () => void;
}

const { TabPane } = Tabs;

const SchemeActions: React.FC<SchemeActionsProps> = ({ scheme, onSuccess }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allRules, setAllRules] = useState<any[]>([]);
  const [selectedRules, setSelectedRules] = useState<any>({});
  const [form] = Form.useForm();

  // 获取所有规则
  useEffect(() => {
    if (rulesModalVisible) {
      const fetchRules = async () => {
        try {
          const rules = await hypergraphApi.getAllSharedRules();
          setAllRules(rules);
          
          // 初始化已选规则
          const initialSelectedRules = {};
          if (scheme.rule_weights) {
            Object.entries(scheme.rule_weights).forEach(([ruleId, config]) => {
              initialSelectedRules[ruleId] = {
                weight: typeof config === 'number' ? config : config.weight || 1.0,
                parameters: typeof config === 'number' ? {} : config.parameters || {}
              };
            });
          }
          setSelectedRules(initialSelectedRules);
        } catch (error) {
          console.error('获取规则失败:', error);
          message.error('获取规则列表失败');
        }
      };
      
      fetchRules();
    }
  }, [rulesModalVisible, scheme]);

  // 打开编辑模态框
  const showEditModal = () => {
    form.setFieldsValue({
      name: scheme.name,
      description: scheme.description || '',
    });
    setEditModalVisible(true);
  };

  // 打开规则管理模态框
  const showRulesModal = () => {
    setRulesModalVisible(true);
  };

  // 处理编辑提交
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await hypergraphApi.updateScheme(scheme.id, {
        name: values.name,
        description: values.description,
      });
      
      message.success('方案更新成功');
      setEditModalVisible(false);
      onSuccess();
    } catch (error) {
      console.error('更新方案失败:', error);
      message.error('更新方案失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理规则管理提交
  const handleRulesSubmit = async () => {
    try {
      setLoading(true);
      
      await hypergraphApi.updateScheme(scheme.id, {
        rule_weights: selectedRules
      });
      
      message.success('方案规则更新成功');
      setRulesModalVisible(false);
      onSuccess();
    } catch (error) {
      console.error('更新方案规则失败:', error);
      message.error('更新方案规则失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      setLoading(true);
      await hypergraphApi.deleteScheme(scheme.id);
      message.success('方案删除成功');
      onSuccess();
    } catch (error) {
      console.error('删除方案失败:', error);
      message.error('删除方案失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加规则
  const handleAddRule = (ruleId: string) => {
    setSelectedRules({
      ...selectedRules,
      [ruleId]: {
        weight: 1.0,
        parameters: {}
      }
    });
  };

  // 移除规则
  const handleRemoveRule = (ruleId: string) => {
    const newSelectedRules = { ...selectedRules };
    delete newSelectedRules[ruleId];
    setSelectedRules(newSelectedRules);
  };

  // 更新规则权重
  const handleWeightChange = (ruleId: string, weight: number) => {
    setSelectedRules({
      ...selectedRules,
      [ruleId]: {
        ...selectedRules[ruleId],
        weight
      }
    });
  };

  // 更新规则参数
  const handleParameterChange = (ruleId: string, paramName: string, paramValue: any) => {
    setSelectedRules({
      ...selectedRules,
      [ruleId]: {
        ...selectedRules[ruleId],
        parameters: {
          ...selectedRules[ruleId].parameters,
          [paramName]: paramValue
        }
      }
    });
  };

  // 获取规则的默认参数
  const getRuleDefaultParameters = (ruleId: string) => {
    const rule = allRules.find(r => r.id === ruleId);
    return rule?.parameters || {};
  };

  // 判断参数类型
  const getParameterType = (paramValue: any): string => {
    if (typeof paramValue === 'number') return 'number';
    if (typeof paramValue === 'string') return 'string';
    if (Array.isArray(paramValue)) return 'array';
    return 'string'; // 默认为字符串类型
  };

  // 渲染参数输入控件
  const renderParameterInput = (ruleId: string, paramName: string, defaultValue: any) => {
    const currentParams = selectedRules[ruleId]?.parameters || {};
    const currentValue = currentParams[paramName] !== undefined ? currentParams[paramName] : defaultValue;
    const paramType = getParameterType(defaultValue);
    
    switch (paramType) {
      case 'number':
        return (
          <InputNumber
            value={currentValue}
            onChange={(value) => handleParameterChange(ruleId, paramName, value)}
            style={{ width: 100 }}
          />
        );
      case 'array':
        return (
          <Select
            mode="tags"
            style={{ width: 150 }}
            value={Array.isArray(currentValue) ? currentValue : [currentValue]}
            onChange={(value) => handleParameterChange(ruleId, paramName, value)}
          />
        );
      case 'string':
      default:
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleParameterChange(ruleId, paramName, e.target.value)}
            style={{ width: 150 }}
          />
        );
    }
  };

  // 规则表格列定义
  const ruleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#999' }}>{record.description}</small>
        </div>
      )
    },
    {
      title: '影响要素类型',
      dataIndex: 'affected_element_types',
      key: 'affected_element_types',
      render: (types: string[]) => (
        <>
          {types?.map(type => (
            <Tag key={type} color="blue">{type}</Tag>
          ))}
        </>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => {
        const isSelected = selectedRules[record.id];
        return (
          <Button
            type={isSelected ? "default" : "primary"}
            size="small"
            icon={isSelected ? <DeleteOutlined /> : <PlusOutlined />}
            onClick={() => isSelected ? handleRemoveRule(record.id) : handleAddRule(record.id)}
          >
            {isSelected ? '移除' : '添加'}
          </Button>
        );
      }
    }
  ];

  // 已选规则表格列定义
  const selectedRuleColumns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权重',
      key: 'weight',
      render: (_, record: any) => (
        <InputNumber
          min={0}
          step={0.1}
          value={selectedRules[record.id]?.weight || 1.0}
          onChange={(value) => handleWeightChange(record.id, value as number)}
          style={{ width: 80 }}
        />
      )
    },
    {
      title: '参数',
      key: 'parameters',
      render: (_, record: any) => {
        const defaultParams = getRuleDefaultParameters(record.id);
        const currentParams = selectedRules[record.id]?.parameters || {};
        
        return (
          <div>
            {Object.entries(defaultParams).map(([paramName, defaultValue]) => (
              <div key={paramName} style={{ marginBottom: 8 }}>
                <span style={{ marginRight: 8 }}>{paramName}:</span>
                {renderParameterInput(record.id, paramName, defaultValue)}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRule(record.id)}
        />
      )
    }
  ];

  return (
    <>
      <Space>
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            showEditModal();
          }}
          size="small"
        />
        
        <Button 
          type="text" 
          icon={<SettingOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            showRulesModal();
          }}
          size="small"
        />
        
        <Popconfirm
          title="确定要删除这个方案吗？"
          description="此操作不可逆，删除后数据将无法恢复。"
          onConfirm={(e) => {
            e?.stopPropagation();
            handleDelete();
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="确定"
          cancelText="取消"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={(e) => e.stopPropagation()}
            size="small"
          />
        </Popconfirm>
      </Space>

      {/* 编辑方案基本信息模态框 */}
      <Modal
        title="编辑方案"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="方案名称"
            rules={[{ required: true, message: '请输入方案名称' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="方案描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 规则管理模态框 */}
      <Modal
        title="管理方案规则"
        open={rulesModalVisible}
        onOk={handleRulesSubmit}
        onCancel={() => setRulesModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Tabs defaultActiveKey="selected">
          <TabPane tab="已选规则" key="selected">
            {Object.keys(selectedRules).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>还没有选择任何规则</p>
                <p>请在"可用规则"标签页中添加规则</p>
              </div>
            ) : (
              <Table
                dataSource={allRules.filter(rule => selectedRules[rule.id])}
                columns={selectedRuleColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            )}
          </TabPane>
          <TabPane tab="可用规则" key="available">
            <Table
              dataSource={allRules}
              columns={ruleColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  );
};

export default SchemeActions; 