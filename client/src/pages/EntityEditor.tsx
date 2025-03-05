import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Form, Input, Button, Select, Switch, Card, Tabs, 
  Table, Tag, Space, Divider, Typography, Row, Col, InputNumber 
} from 'antd';
import { PlusOutlined, LinkOutlined, NodeIndexOutlined, TagsOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const EditorContainer = styled.div`
  padding: 0 20px;
`;

const AttributeFormItem = styled(Form.Item)`
  margin-bottom: 12px;
`;

const EntityCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const RelationCard = styled(Card)`
  background: #f0f5ff;
  margin-bottom: 16px;
  border-radius: 8px;
`;

interface EntityAttribute {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  value: any;
  options?: string[];
}

interface EntityRelation {
  key: string;
  targetEntity: string;
  relationType: string;
  properties: { key: string; name: string; value: any }[];
}

const EntityEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  
  const [entityName, setEntityName] = useState(isEditing ? '故宫博物院' : '');
  const [entityType, setEntityType] = useState(isEditing ? 'attraction' : '');
  const [attributes, setAttributes] = useState<EntityAttribute[]>(isEditing ? [
    { key: '1', name: '开放时间', type: 'string', value: '8:30-17:00' },
    { key: '2', name: '门票价格', type: 'number', value: 60 },
    { key: '3', name: '周一闭馆', type: 'boolean', value: true },
    { key: '4', name: '适合人群', type: 'enum', value: ['家庭', '情侣'], options: ['家庭', '情侣', '学生', '老年人'] }
  ] : []);
  
  const [relations, setRelations] = useState<EntityRelation[]>(isEditing ? [
    { 
      key: '1', 
      targetEntity: '天安门广场', 
      relationType: '邻近',
      properties: [
        { key: '1', name: '距离', value: '500米' },
        { key: '2', name: '步行时间', value: '10分钟' }
      ]
    },
    { 
      key: '2', 
      targetEntity: '故宫门票', 
      relationType: '包含',
      properties: [
        { key: '1', name: '必需', value: true }
      ]
    }
  ] : []);

  const entityTypes = [
    { value: 'attraction', label: '景点' },
    { value: 'restaurant', label: '餐厅' },
    { value: 'hotel', label: '酒店' },
    { value: 'transportation', label: '交通' },
    { value: 'activity', label: '活动' },
    { value: 'user', label: '用户' }
  ];

  const attributeTypes = [
    { value: 'string', label: '文本' },
    { value: 'number', label: '数值' },
    { value: 'boolean', label: '布尔值' },
    { value: 'date', label: '日期' },
    { value: 'enum', label: '枚举' }
  ];

  const relationTypes = [
    { value: 'near', label: '邻近' },
    { value: 'contains', label: '包含' },
    { value: 'requires', label: '需要' },
    { value: 'recommends', label: '推荐' },
    { value: 'excludes', label: '排除' }
  ];

  const addAttribute = () => {
    const newAttribute: EntityAttribute = {
      key: Date.now().toString(),
      name: '',
      type: 'string',
      value: ''
    };
    setAttributes([...attributes, newAttribute]);
  };

  const removeAttribute = (key: string) => {
    setAttributes(attributes.filter(attr => attr.key !== key));
  };

  const updateAttribute = (key: string, field: keyof EntityAttribute, value: any) => {
    setAttributes(attributes.map(attr => 
      attr.key === key ? { ...attr, [field]: value } : attr
    ));
  };

  const addRelation = () => {
    const newRelation: EntityRelation = {
      key: Date.now().toString(),
      targetEntity: '',
      relationType: '',
      properties: []
    };
    setRelations([...relations, newRelation]);
  };

  const removeRelation = (key: string) => {
    setRelations(relations.filter(rel => rel.key !== key));
  };

  const addRelationProperty = (relationKey: string) => {
    const relation = relations.find(rel => rel.key === relationKey);
    if (relation) {
      const newProperty = {
        key: Date.now().toString(),
        name: '',
        value: ''
      };
      setRelations(relations.map(rel => 
        rel.key === relationKey 
          ? { ...rel, properties: [...rel.properties, newProperty] } 
          : rel
      ));
    }
  };

  const removeRelationProperty = (relationKey: string, propertyKey: string) => {
    setRelations(relations.map(rel => 
      rel.key === relationKey 
        ? { ...rel, properties: rel.properties.filter(prop => prop.key !== propertyKey) } 
        : rel
    ));
  };

  const updateRelation = (key: string, field: keyof EntityRelation, value: any) => {
    setRelations(relations.map(rel => 
      rel.key === key ? { ...rel, [field]: value } : rel
    ));
  };

  const updateRelationProperty = (relationKey: string, propertyKey: string, field: string, value: any) => {
    setRelations(relations.map(rel => 
      rel.key === relationKey 
        ? { 
            ...rel, 
            properties: rel.properties.map(prop => 
              prop.key === propertyKey ? { ...prop, [field]: value } : prop
            ) 
          } 
        : rel
    ));
  };

  const handleSubmit = () => {
    const entityData = {
      name: entityName,
      type: entityType,
      attributes,
      relations
    };
    console.log('提交实体数据:', entityData);
    // 这里添加保存逻辑
  };

  return (
    <EditorContainer>
      <Title level={2}>{isEditing ? '编辑实体' : '创建新实体'}</Title>
      <Divider />
      
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="实体名称" required>
                  <Input 
                    value={entityName} 
                    onChange={e => setEntityName(e.target.value)} 
                    placeholder="输入实体名称"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实体类型" required>
                  <Select
                    value={entityType}
                    onChange={value => setEntityType(value)}
                    placeholder="选择实体类型"
                  >
                    {entityTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </TabPane>
        
        <TabPane tab="属性" key="attributes">
          <Button 
            type="dashed" 
            onClick={addAttribute} 
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            添加属性
          </Button>
          
          {attributes.map(attr => (
            <EntityCard key={attr.key}>
              <Row gutter={16}>
                <Col span={6}>
                  <AttributeFormItem label="属性名称">
                    <Input 
                      value={attr.name} 
                      onChange={e => updateAttribute(attr.key, 'name', e.target.value)}
                      placeholder="属性名称"
                    />
                  </AttributeFormItem>
                </Col>
                <Col span={6}>
                  <AttributeFormItem label="属性类型">
                    <Select
                      value={attr.type}
                      onChange={value => updateAttribute(attr.key, 'type', value)}
                    >
                      {attributeTypes.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </AttributeFormItem>
                </Col>
                <Col span={10}>
                  <AttributeFormItem label="属性值">
                    {attr.type === 'string' && (
                      <Input 
                        value={attr.value} 
                        onChange={e => updateAttribute(attr.key, 'value', e.target.value)}
                      />
                    )}
                    {attr.type === 'number' && (
                      <InputNumber 
                        value={attr.value} 
                        onChange={value => updateAttribute(attr.key, 'value', value)}
                        style={{ width: '100%' }}
                      />
                    )}
                    {attr.type === 'boolean' && (
                      <Switch 
                        checked={attr.value} 
                        onChange={value => updateAttribute(attr.key, 'value', value)}
                      />
                    )}
                    {attr.type === 'enum' && (
                      <Select
                        mode="multiple"
                        value={attr.value}
                        onChange={value => updateAttribute(attr.key, 'value', value)}
                        style={{ width: '100%' }}
                      >
                        {(attr.options || []).map(option => (
                          <Option key={option} value={option}>{option}</Option>
                        ))}
                      </Select>
                    )}
                  </AttributeFormItem>
                </Col>
                <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Button 
                    danger 
                    onClick={() => removeAttribute(attr.key)}
                    style={{ marginTop: 20 }}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
            </EntityCard>
          ))}
        </TabPane>
        
        <TabPane tab="关系" key="relations">
          <Button 
            type="dashed" 
            onClick={addRelation} 
            style={{ marginBottom: 16 }}
            icon={<LinkOutlined />}
          >
            添加关系
          </Button>
          
          {relations.map(relation => (
            <RelationCard key={relation.key}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="目标实体">
                    <Input 
                      value={relation.targetEntity} 
                      onChange={e => updateRelation(relation.key, 'targetEntity', e.target.value)}
                      placeholder="目标实体名称"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="关系类型">
                    <Select
                      value={relation.relationType}
                      onChange={value => updateRelation(relation.key, 'relationType', value)}
                      placeholder="选择关系类型"
                    >
                      {relationTypes.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button 
                    danger 
                    onClick={() => removeRelation(relation.key)}
                    style={{ marginTop: 20 }}
                  >
                    删除关系
                  </Button>
                </Col>
              </Row>
              
              <Divider orientation="left">关系属性</Divider>
              
              <Button 
                type="dashed" 
                onClick={() => addRelationProperty(relation.key)} 
                style={{ marginBottom: 16 }}
                icon={<TagsOutlined />}
                size="small"
              >
                添加属性
              </Button>
              
              {relation.properties.map(prop => (
                <Row gutter={16} key={prop.key} style={{ marginBottom: 8 }}>
                  <Col span={8}>
                    <Input 
                      value={prop.name} 
                      onChange={e => updateRelationProperty(relation.key, prop.key, 'name', e.target.value)}
                      placeholder="属性名称"
                      size="small"
                    />
                  </Col>
                  <Col span={12}>
                    <Input 
                      value={prop.value} 
                      onChange={e => updateRelationProperty(relation.key, prop.key, 'value', e.target.value)}
                      placeholder="属性值"
                      size="small"
                    />
                  </Col>
                  <Col span={4}>
                    <Button 
                      danger 
                      size="small"
                      onClick={() => removeRelationProperty(relation.key, prop.key)}
                    >
                      删除
                    </Button>
                  </Col>
                </Row>
              ))}
            </RelationCard>
          ))}
        </TabPane>
      </Tabs>
      
      <Divider />
      
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={handleSubmit}>
          {isEditing ? '保存修改' : '创建实体'}
        </Button>
      </div>
    </EditorContainer>
  );
};

export default EntityEditor; 