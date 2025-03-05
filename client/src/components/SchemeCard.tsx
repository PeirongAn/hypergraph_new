import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography, Form, TimePicker, Input, Select, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const DetailForm = styled.div`
  margin-top: 16px;
`;

interface SchemeCardProps {
  id: string;
  title: string;
  status?: 'normal' | 'warning' | 'error';
  initialValues?: SchemeFormData;
  onChange?: (values: SchemeFormData) => void;
}

export interface SchemeFormData {
  startTime?: string | null;
  endTime?: string | null;
  attractions?: string[];
  transportation?: string;
  dining?: string;
}

const SchemeCard: React.FC<SchemeCardProps> = ({
  id,
  title,
  status = 'normal',
  initialValues,
  onChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const [form] = Form.useForm<SchemeFormData>();

  useEffect(() => {
    if (initialValues) {
      const formattedValues = {
        ...initialValues,
        startTime: initialValues.startTime ? dayjs(initialValues.startTime, 'HH:mm') : null,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime, 'HH:mm') : null,
      };
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    const formattedValues = {
      ...values,
      startTime: values.startTime ? values.startTime.format('HH:mm') : null,
      endTime: values.endTime ? values.endTime.format('HH:mm') : null,
    };
    onChange?.(formattedValues);
  };

  const getStatusTag = () => {
    switch (status) {
      case 'error':
        return <Tag color="error">⚠️ 冲突</Tag>;
      case 'warning':
        return <Tag color="warning">⚠️ 警告</Tag>;
      default:
        return <Tag color="success">✅ 正常</Tag>;
    }
  };

  return (
    <StyledCard
      id={id}
      size="small"
      bodyStyle={{ padding: expanded ? '12px' : '8px' }}
    >
      <CardHeader onClick={() => setExpanded(!expanded)}>
        <div>
          <Text strong>{title}</Text>
          {getStatusTag()}
        </div>
        {expanded ? <UpOutlined /> : <DownOutlined />}
      </CardHeader>

      {expanded && (
        <DetailForm>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormChange}
          >
            <Form.Item label="时间" style={{ marginBottom: 12 }}>
              <Form.Item
                name="startTime"
                style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginBottom: 0 }}
              >
                <TimePicker format="HH:mm" placeholder="开始时间" />
              </Form.Item>
              <Form.Item
                name="endTime"
                style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 0 0 16px' }}
              >
                <TimePicker format="HH:mm" placeholder="结束时间" />
              </Form.Item>
            </Form.Item>

            <Form.Item name="attractions" label="景点">
              <Select mode="multiple" placeholder="选择景点">
                <Option value="故宫">故宫</Option>
                <Option value="天安门">天安门</Option>
                <Option value="景山公园">景山公园</Option>
                <Option value="颐和园">颐和园</Option>
              </Select>
            </Form.Item>

            <Form.Item name="transportation" label="出行方式">
              <Select placeholder="选择出行方式">
                <Option value="步行">步行</Option>
                <Option value="公交">公交</Option>
                <Option value="地铁">地铁</Option>
                <Option value="出租车">出租车</Option>
                <Option value="包车">包车</Option>
              </Select>
            </Form.Item>

            <Form.Item name="dining" label="餐饮方式">
              <Select placeholder="选择餐饮方式">
                <Option value="自助餐">自助餐</Option>
                <Option value="中餐">中餐</Option>
                <Option value="西餐">西餐</Option>
                <Option value="快餐">快餐</Option>
              </Select>
            </Form.Item>
          </Form>
        </DetailForm>
      )}
    </StyledCard>
  );
};

export default SchemeCard; 