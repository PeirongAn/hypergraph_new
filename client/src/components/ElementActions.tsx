import React, { useState } from 'react';
import { Button, Popconfirm, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';

interface ElementActionsProps {
  element: any;
  onSuccess: () => void;
}

const ElementActions: React.FC<ElementActionsProps> = ({ element, onSuccess }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 打开编辑模态框
  const showEditModal = () => {
    // 设置表单初始值
    const initialValues = {
      name: element.element_name || element.name || '',
    };
    
    // 添加其他属性
    if (element.attributes) {
      Object.entries(element.attributes).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'name' && key !== 'type') {
          initialValues[key] = value;
        }
      });
    }
    
    form.setFieldsValue(initialValues);
    setEditModalVisible(true);
  };

  // 处理编辑提交
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 构建更新数据
      const updateData = { ...values };
      delete updateData.name; // 移除名称，单独处理
      
      const elementId = element.element_id || element.id;
      await hypergraphApi.updateSharedElement(elementId, {
        attributes: {
          ...updateData,
          name: values.name,
        }
      });
      
      message.success('要素更新成功');
      setEditModalVisible(false);
      onSuccess();
    } catch (error) {
      console.error('更新要素失败:', error);
      message.error('更新要素失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      setLoading(true);
      const elementId = element.element_id || element.id;
      await hypergraphApi.deleteSharedElement(elementId);
      message.success('要素删除成功');
      onSuccess();
    } catch (error) {
      console.error('删除要素失败:', error);
      message.error('删除要素失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        type="text" 
        icon={<EditOutlined />} 
        onClick={(e) => {
          e.stopPropagation();
          showEditModal();
        }}
        size="small"
      />
      
      <Popconfirm
        title="确定要删除这个要素吗？"
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

      <Modal
        title="编辑要素"
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
            label="要素名称"
            rules={[{ required: true, message: '请输入要素名称' }]}
          >
            <Input />
          </Form.Item>
          
          {/* 动态生成其他属性的表单项 */}
          {element.attributes && Object.entries(element.attributes).map(([key, value]) => {
            if (key !== 'id' && key !== 'name' && key !== 'type') {
              return (
                <Form.Item
                  key={key}
                  name={key}
                  label={key}
                >
                  <Input />
                </Form.Item>
              );
            }
            return null;
          })}
        </Form>
      </Modal>
    </>
  );
};

export default ElementActions; 