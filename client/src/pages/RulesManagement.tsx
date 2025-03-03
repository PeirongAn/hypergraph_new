import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, Space,  message,  Modal, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import RuleDetail from '../components/RuleDetail';
import RuleForm from '../components/RuleForm';

const { Title } = Typography;

interface Rule {
  id: string;
  name: string;
  weight: number;
  affected_element_types: string[];
  affected_element_keys: string[];
  description?: string;
  code?: string;
}

const RulesManagement: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  
  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await hypergraphApi.getAllSharedRules();
      setRules(data);
    } catch (error) {
      console.error('获取规则失败:', error);
      message.error('获取规则失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRules();
  }, []);
  
  const handleCreate = () => {
    setEditingRule(null);
    setIsModalVisible(true);
  };
  
  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setIsModalVisible(true);
  };
  
  const handleView = (rule: Rule) => {
    setSelectedRule(rule);
    setIsDetailModalVisible(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      console.log(`删除规则: ID=${id}`);
      
      await hypergraphApi.deleteSharedRule(id);
      message.success('规则删除成功');
      fetchRules();
    } catch (error) {
      console.error('删除规则失败:', error);
      message.error('删除规则失败');
    }
  };
  
  const handleFormSubmit = async (values: any) => {
    try {
      if (editingRule) {
        console.log(`更新规则: ID=${editingRule.id}, 数据=`, values);
        
        // 更新规则
        await hypergraphApi.updateSharedRule(editingRule.id, values);
        message.success('规则更新成功');
      } else {
        // 创建新规则
        console.log('创建规则:', values);
        
        await hypergraphApi.createSharedRule(values);
        message.success('规则创建成功');
      }
      
      setIsModalVisible(false);
      fetchRules();
    } catch (error) {
      console.error('保存规则失败:', error);
      message.error('保存规则失败');
    }
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => weight.toFixed(1),
    },
    {
      title: '影响的要素类型',
      dataIndex: 'affected_element_types',
      key: 'affected_element_types',
      render: (types: string[]) => (
        <>
          {types.map(type => (
            <Tag color="blue" key={type}>
              {type}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '使用的属性',
      dataIndex: 'affected_element_keys',
      key: 'affected_element_keys',
      render: (keys: string[]) => (
        <>
          {keys && keys.length > 0 ? (
            <>
              {keys.slice(0, 3).map(key => (
                <Tag color="green" key={key}>
                  {key}
                </Tag>
              ))}
              {keys.length > 3 && (
                <Tooltip title={keys.slice(3).join(', ')}>
                  <Tag color="green">+{keys.length - 3}</Tag>
                </Tooltip>
              )}
            </>
          ) : (
            <span>-</span>
          )}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Rule) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<InfoCircleOutlined />} 
            onClick={() => handleView(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={3}>规则管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            添加规则
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={rules} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        
        <Modal
          title={editingRule ? "编辑规则" : "创建规则"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          <RuleForm
            initialValues={editingRule}
            onFinish={handleFormSubmit}
            onCancel={() => setIsModalVisible(false)}
            isEditing={!!editingRule}
          />
        </Modal>
        
        <Modal
          title="规则详情"
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedRule && <RuleDetail rule={selectedRule} />}
        </Modal>
      </Card>
    </div>
  );
};

export default RulesManagement; 