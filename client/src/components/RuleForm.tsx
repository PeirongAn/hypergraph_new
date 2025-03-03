import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Typography, Divider, Tag } from 'antd';
import MonacoEditor from 'react-monaco-editor';
import { hypergraphApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

interface RuleFormProps {
  initialValues?: any;
  onFinish: (values: any) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const RuleForm: React.FC<RuleFormProps> = ({ initialValues, onFinish, onCancel, isEditing }) => {
  const [form] = Form.useForm();
  const [elementTypes, setElementTypes] = useState<string[]>([]);
  const [elementKeys, setElementKeys] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // 获取所有要素类型和键
  useEffect(() => {
    const fetchElementData = async () => {
      try {
        const response = await hypergraphApi.getAllSharedElements();
        const types = Object.keys(response);
        setElementTypes(types);
        
        // 提取所有要素的键
        const allKeys = new Set<string>();
        Object.values(response).forEach((elements: any[]) => {
          elements.forEach((element: any) => {
            // 处理可能的不同数据结构
            const attributes = element.attributes || element;
            
            // 排除基本字段
            Object.keys(attributes).forEach(key => {
              if (key !== 'id' && key !== 'type' && key !== 'name' && 
                  key !== 'created_at' && key !== 'updated_at' && 
                  key !== 'attributes') {
                allKeys.add(key);
              }
            });
          });
        });
        
        setElementKeys(Array.from(allKeys));
      } catch (error) {
        console.error('获取要素数据失败:', error);
      }
    };
    
    fetchElementData();
  }, []);
  
  // 当选择的要素类型变化时，更新可用的键
  useEffect(() => {
    const updateAvailableKeys = async () => {
      if (selectedTypes.length === 0) {
        return;
      }
      
      try {
        const response = await hypergraphApi.getAllSharedElements();
        const filteredKeys = new Set<string>();
        
        selectedTypes.forEach(type => {
          const elements = response[type] || [];
          elements.forEach((element: any) => {
            // 注意：属性存储在 attributes 字段中
            if (element.attributes) {
              Object.keys(element.attributes).forEach(key => {
                // 排除 id 和 name
                if (key !== 'id' && key !== 'name') {
                  filteredKeys.add(key);
                }
              });
            }
          });
        });
        
        setElementKeys(Array.from(filteredKeys));
      } catch (error) {
        console.error('获取要素键失败:', error);
      }
    };
    
    updateAvailableKeys();
  }, [selectedTypes]);
  
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (initialValues.affected_element_types) {
        setSelectedTypes(initialValues.affected_element_types);
      }
    } else {
      form.resetFields();
    }
  }, [form, initialValues]);
  
  const handleTypeChange = (values: string[]) => {
    setSelectedTypes(values);
    form.setFieldsValue({ affected_element_types: values });
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues || { 
        weight: 1.0,
        affected_element_types: [],
        affected_element_keys: [],
        code: "# 输入规则代码\n# attrs 是要素的属性字典\n# 返回值大于0表示规则匹配，将乘以权重作为最终得分\n\nif '属性名' in attrs:\n    return 1.0\nreturn 0.0"
      }}
    >
      {!isEditing && (
        <Form.Item
          name="name"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="输入规则名称" />
        </Form.Item>
      )}
      
      <Form.Item
        name="weight"
        label="规则权重"
        rules={[{ required: true, message: '请输入规则权重' }]}
      >
        <InputNumber min={0.1} max={10} step={0.1} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="规则描述"
      >
        <TextArea rows={2} placeholder="描述规则的作用" />
      </Form.Item>
      
      <Form.Item
        name="affected_element_types"
        label="影响的要素类型"
        rules={[{ required: true, message: '请选择影响的要素类型' }]}
      >
        <Select 
          mode="multiple" 
          placeholder="选择要素类型"
          onChange={handleTypeChange}
        >
          {elementTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="affected_element_keys"
        label="影响的要素属性"
        rules={[{ required: true, message: '请选择影响的要素属性' }]}
        help="选择规则将使用的要素属性"
      >
        <Select 
          mode="multiple" 
          placeholder="选择要素属性"
          disabled={selectedTypes.length === 0}
        >
          {elementKeys.map(key => (
            <Option key={key} value={key}>{key}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Divider>规则代码</Divider>
      
      <div style={{ marginBottom: '16px' }}>
        <Title level={5}>可用的属性键:</Title>
        <div style={{ marginTop: '8px' }}>
          {elementKeys.map(key => (
            <Tag color="blue" key={key} style={{ marginBottom: '8px' }}>{key}</Tag>
          ))}
        </div>
      </div>
      
      <Form.Item
        name="code"
        label="规则代码"
        rules={[{ required: true, message: '请输入规则代码' }]}
        help="使用Python代码定义规则。attrs参数包含要素的所有属性。"
      >
        <div style={{ border: '1px solid #d9d9d9', borderRadius: '2px' }}>
          <MonacoEditor
            height="300"
            language="python"
            theme="vs"
            value={form.getFieldValue('code')}
            onChange={(value) => form.setFieldsValue({ code: value })}
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
            }}
          />
        </div>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
        <Button onClick={onCancel} style={{ marginLeft: 8 }}>
          取消
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RuleForm; 