import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Typography, Space, Popconfirm, message, Tabs, Form, Input, Select, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Element {
  id: string;
  type: string;
  attributes: Record<string, any>;
}

const ElementsManagement: React.FC = () => {
  const [elements, setElements] = useState<Record<string, Element[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [form] = Form.useForm();
  const [elementType, setElementType] = useState<string>('景点');
  
  const fetchElements = async () => {
    try {
      setLoading(true);
      const data = await hypergraphApi.getAllSharedElements();
      setElements(data);
    } catch (error) {
      console.error('获取要素失败:', error);
      message.error('获取要素失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchElements();
  }, []);
  
  const handleDelete = async (id: string) => {
    try {
      await hypergraphApi.deleteSharedElement(id);
      message.success('要素删除成功');
      fetchElements();
    } catch (error) {
      console.error('删除要素失败:', error);
      message.error('删除要素失败');
    }
  };
  
  const showModal = (element: Element | null = null) => {
    setEditingElement(element);
    
    if (element) {
      form.setFieldsValue({
        id: element.id,
        type: element.type,
        ...element.attributes
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ type: elementType });
    }
    
    setIsModalVisible(true);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  
  const handleSubmit = async (values: any) => {
    try {
      const { id, type, ...attributes } = values;
      
      if (editingElement) {
        // 更新要素
        await hypergraphApi.updateSharedElement(id, { attributes });
        message.success('要素更新成功');
      } else {
        // 创建新要素
        await hypergraphApi.createSharedElement({ id, type, attributes });
        message.success('要素创建成功');
      }
      
      setIsModalVisible(false);
      fetchElements();
    } catch (error) {
      console.error('保存要素失败:', error);
      message.error('保存要素失败');
    }
  };
  
  const renderElementTables = () => {
    return Object.entries(elements).map(([type, elementList]) => {
      // 动态生成列
      const allKeys = new Set<string>();
      elementList.forEach(element => {
        Object.keys(element.attributes).forEach(key => allKeys.add(key));
      });
      
      const columns = [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          width: 100,
        },
        ...Array.from(allKeys).map(key => ({
          title: key,
          dataIndex: ['attributes', key],
          key,
          render: (value: any) => {
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            return value;
          },
        })),
        {
          title: '操作',
          key: 'action',
          render: (_: any, record: Element) => (
            <Space size="middle">
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => showModal(record)}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个要素吗?"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />} size="small">
                  删除
                </Button>
              </Popconfirm>
            </Space>
          ),
        },
      ];
      
      return (
        <TabPane tab={type} key={type}>
          <div className="mb-4 flex justify-between">
            <Title level={4}>{type}要素</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setElementType(type);
                showModal();
              }}
            >
              添加{type}
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={elementList}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </TabPane>
      );
    });
  };
  
  return (
    <div className="elements-management">
      <Card>
        <div className="mb-4">
          <Title level={2}>要素管理</Title>
        </div>
        
        <Tabs defaultActiveKey="景点">
          {renderElementTables()}
        </Tabs>
        
        <Modal
          title={editingElement ? "编辑要素" : "创建新要素"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="id"
              label="ID"
              rules={[{ required: true, message: '请输入要素ID' }]}
            >
              <Input disabled={!!editingElement} />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="类型"
              rules={[{ required: true, message: '请选择要素类型' }]}
            >
              <Select disabled={!!editingElement}>
                <Option value="景点">景点</Option>
                <Option value="美食">美食</Option>
                <Option value="住宿">住宿</Option>
              </Select>
            </Form.Item>
            
            {/* 动态属性字段，根据类型不同显示不同的字段 */}
            {form.getFieldValue('type') === '景点' && (
              <>
                <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="价格" label="价格" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="评分" label="评分" rules={[{ required: true }]}>
                  <Input type="number" step="0.1" min="0" max="5" />
                </Form.Item>
                <Form.Item name="季节" label="季节">
                  <Select mode="multiple">
                    <Option value="春">春</Option>
                    <Option value="夏">夏</Option>
                    <Option value="秋">秋</Option>
                    <Option value="冬">冬</Option>
                  </Select>
                </Form.Item>
              </>
            )}
            
            {form.getFieldValue('type') === '美食' && (
              <>
                <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="人均消费" label="人均消费" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="评分" label="评分" rules={[{ required: true }]}>
                  <Input type="number" step="0.1" min="0" max="5" />
                </Form.Item>
                <Form.Item name="标签" label="标签">
                  <Select mode="multiple">
                    <Option value="本地特色">本地特色</Option>
                    <Option value="辣">辣</Option>
                    <Option value="面食">面食</Option>
                    <Option value="小吃">小吃</Option>
                    <Option value="海鲜">海鲜</Option>
                  </Select>
                </Form.Item>
              </>
            )}
            
            {form.getFieldValue('type') === '住宿' && (
              <>
                <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="价格" label="价格" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="距离地铁" label="距离地铁(米)" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="评分" label="评分" rules={[{ required: true }]}>
                  <Input type="number" step="0.1" min="0" max="5" />
                </Form.Item>
              </>
            )}
            
            <Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
                取消
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ElementsManagement; 