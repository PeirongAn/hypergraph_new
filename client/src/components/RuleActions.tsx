import React, { useState } from 'react';
import { Button, Popconfirm, Modal, message, Spin } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { hypergraphApi } from '../services/api';
import RuleForm from './RuleForm';

interface RuleActionsProps {
  rule: any;
  onSuccess: () => void;
}

const RuleActions: React.FC<RuleActionsProps> = ({ rule, onSuccess }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ruleDetails, setRuleDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // 获取规则详情
  const fetchRuleDetails = async () => {
    try {
      setFetchingDetails(true);
      const details = await hypergraphApi.getSharedRule(rule.rule_id);
      setRuleDetails(details);
      setEditModalVisible(true);
    } catch (error) {
      console.error('获取规则详情失败:', error);
      message.error('获取规则详情失败');
    } finally {
      setFetchingDetails(false);
    }
  };

  // 处理编辑提交
  const handleEditSubmit = async (values: any) => {
    try {
      setLoading(true);
      await hypergraphApi.updateSharedRule(rule.rule_id, values);
      message.success('规则更新成功');
      setEditModalVisible(false);
      setRuleDetails(null); // 清空规则详情
      onSuccess();
    } catch (error) {
      console.error('更新规则失败:', error);
      message.error('更新规则失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      setLoading(true);
      await hypergraphApi.deleteSharedRule(rule.rule_id);
      message.success('规则删除成功');
      onSuccess();
    } catch (error) {
      console.error('删除规则失败:', error);
      message.error('删除规则失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理模态框关闭
  const handleModalClose = () => {
    setEditModalVisible(false);
    setRuleDetails(null); // 清空规则详情
  };

  return (
    <>
      <Button 
        type="text" 
        icon={<EditOutlined />} 
        onClick={(e) => {
          e.stopPropagation();
          fetchRuleDetails(); // 获取规则详情
        }}
        size="small"
        loading={fetchingDetails}
      />
      
      <Popconfirm
        title="确定要删除这个规则吗？"
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
        title="编辑规则"
        open={editModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {fetchingDetails ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin tip="加载规则详情..." />
          </div>
        ) : ruleDetails ? (
          <RuleForm
            initialValues={ruleDetails}
            onFinish={handleEditSubmit}
            onCancel={handleModalClose}
            isEditing={true}
          />
        ) : null}
      </Modal>
    </>
  );
};

export default RuleActions; 