import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Tag, Typography, Form, DatePicker, Select, InputNumber, Collapse, Button, Space, Input } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined, CarOutlined, CoffeeOutlined, CalendarOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

interface SchemeCardProps {
  $isActive?: boolean;
}

const SchemeCard = styled(Card)<SchemeCardProps>`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  
  ${props => props.$isActive && `
    border: 2px solid #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  `}
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const SchemeTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const FormSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledCollapse = styled(Collapse)`
  background-color: transparent;
  border: none;
  
  .ant-collapse-item {
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #f0f0f0;
    background-color: #fafafa;
    overflow: hidden;
  }
  
  .ant-collapse-header {
    padding: 12px 16px !important;
    background-color: #f5f5f5;
  }
  
  .ant-collapse-content {
    border-top: 1px solid #f0f0f0;
  }
  
  .ant-collapse-content-box {
    padding: 16px !important;
  }
`;

const HighlightablePanel = styled(Panel)<{ $isActive: boolean }>`
  .ant-collapse-header {
    background-color: ${props => props.$isActive ? '#e6f7ff' : '#f5f5f5'} !important;
    border-left: ${props => props.$isActive ? '3px solid #1890ff' : 'none'};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const AddButton = styled(Button)`
  margin-top: 8px;
`;

interface SchemeLaneProps {
  onSchemeClick: (schemeId: string) => void;
  activeSchemes: string[];
  onToggleRuleView: () => void;
  onNodeClick: (nodeId: string) => void;
  activeNodes: string[];
}

interface TagsState {
  spots: string[];
  dining: string[];
  transport: string[];
}

const SchemeLane: React.FC<SchemeLaneProps> = ({ onSchemeClick, activeSchemes, onToggleRuleView, onNodeClick, activeNodes }) => {
  // 状态管理
  const [inputVisible, setInputVisible] = useState<{visible: boolean, section: string, scheme: number}>({
    visible: false, 
    section: '', 
    scheme: 0
  });
  const [inputValue, setInputValue] = useState('');
  
  // 方案1的标签
  const [tags1, setTags1] = useState<TagsState>({
    spots: ['故宫', '天安门', '景山公园'],
    dining: ['标准型', '中式餐厅'],
    transport: ['公共交通', '步行']
  });
  
  // 方案2的标签
  const [tags2, setTags2] = useState<TagsState>({
    spots: ['颐和园'],
    dining: ['经济型'],
    transport: ['公共交通']
  });
  
  const inputRef = React.useRef<Input>(null);

  // 处理标签关闭
  const handleClose = (tag: string, section: string, schemeNum: number) => {
    if (schemeNum === 1) {
      setTags1({
        ...tags1,
        [section]: tags1[section as keyof TagsState].filter(t => t !== tag)
      });
    } else {
      setTags2({
        ...tags2,
        [section]: tags2[section as keyof TagsState].filter(t => t !== tag)
      });
    }
  };

  // 显示输入框
  const showInput = (section: string, schemeNum: number) => {
    setInputVisible({
      visible: true,
      section,
      scheme: schemeNum
    });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 处理输入确认
  const handleInputConfirm = () => {
    const { section, scheme } = inputVisible;
    
    if (inputValue) {
      if (scheme === 1) {
        const currentTags = tags1[section as keyof TagsState];
        if (!currentTags.includes(inputValue)) {
          setTags1({
            ...tags1,
            [section]: [...currentTags, inputValue]
          });
        }
      } else {
        const currentTags = tags2[section as keyof TagsState];
        if (!currentTags.includes(inputValue)) {
          setTags2({
            ...tags2,
            [section]: [...currentTags, inputValue]
          });
        }
      }
    }
    
    setInputVisible({visible: false, section: '', scheme: 0});
    setInputValue('');
  };

  // 渲染标签组
  const renderTags = (section: string, schemeNum: number) => {
    const tags = schemeNum === 1 ? 
      tags1[section as keyof TagsState] : 
      tags2[section as keyof TagsState];
    
    const isCurrentInputVisible = 
      inputVisible.visible && 
      inputVisible.section === section && 
      inputVisible.scheme === schemeNum;
    
    return (
      <TagsContainer>
        {tags.map(tag => (
          <Tag
            key={tag}
            closable
            onClose={e => {
              e.preventDefault();
              handleClose(tag, section, schemeNum);
            }}
          >
            {tag}
          </Tag>
        ))}
        {isCurrentInputVisible && (
          <Input
            ref={inputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        )}
        {!isCurrentInputVisible && (
          <Tag 
            onClick={() => showInput(section, schemeNum)} 
            style={{ borderStyle: 'dashed', cursor: 'pointer' }}
          >
            <PlusOutlined /> 添加
          </Tag>
        )}
      </TagsContainer>
    );
  };

  return (
    <div>
      <SchemeCard 
        id="scheme-1" 
        $isActive={activeSchemes.includes('scheme-1')}
        onClick={() => onSchemeClick('scheme-1')}
      >
        <SchemeTitle>
          <Title level={4}>故宫一日游</Title>
          <Tag color="blue">已发布</Tag>
        </SchemeTitle>
        
        <Form layout="vertical" size="small">
          <Form.Item label="行程总日期">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        
        <StyledCollapse defaultActiveKey={['day1']}>
          <HighlightablePanel 
            $isActive={activeNodes.includes('scheme-1-day1')}
            header={
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发折叠面板的展开/收起
                  onNodeClick('scheme-1-day1');
                }}
              >
                <CalendarOutlined />
                <span>Day 1</span>
              </div>
            } 
            key="day1"
          >
            <div id="scheme-1-day1">
              <Form layout="vertical" size="small">
                <FormSection>
                  <SectionTitle>
                    <EnvironmentOutlined />
                    <span>景点安排</span>
                  </SectionTitle>
                  {renderTags('spots', 1)}
                </FormSection>
                
                <FormSection>
                  <SectionTitle>
                    <CoffeeOutlined />
                    <span>餐饮安排</span>
                  </SectionTitle>
                  {renderTags('dining', 1)}
                </FormSection>
                
                <FormSection>
                  <SectionTitle>
                    <CarOutlined />
                    <span>交通安排</span>
                  </SectionTitle>
                  {renderTags('transport', 1)}
                </FormSection>
              </Form>
            </div>
          </HighlightablePanel>
        </StyledCollapse>
        
        <AddButton type="dashed" block icon={<PlusOutlined />} onClick={onToggleRuleView}>
          添加规则
        </AddButton>
      </SchemeCard>
      
      <SchemeCard 
        id="scheme-2" 
        $isActive={activeSchemes.includes('scheme-2')}
        onClick={() => onSchemeClick('scheme-2')}
      >
        <SchemeTitle>
          <Title level={4}>颐和园半日游</Title>
          <Tag color="green">草稿</Tag>
        </SchemeTitle>
        
        <Form layout="vertical" size="small">
          <Form.Item label="行程总日期">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        
        <StyledCollapse defaultActiveKey={['day1']}>
          <HighlightablePanel 
            $isActive={activeNodes.includes('scheme-2-day1')}
            header={
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick('scheme-2-day1');
                }}
              >
                <CalendarOutlined />
                <span>Day 1</span>
              </div>
            } 
            key="day1"
          >
            <div id="scheme-2-day1">
              <Form layout="vertical" size="small">
                <FormSection>
                  <SectionTitle>
                    <CalendarOutlined />
                    <span>日期安排</span>
                  </SectionTitle>
                  <Form.Item label="日期">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </FormSection>
                
                <FormSection>
                  <SectionTitle>
                    <EnvironmentOutlined />
                    <span>景点安排</span>
                  </SectionTitle>
                  {renderTags('spots', 2)}
                </FormSection>
                
                <FormSection>
                  <SectionTitle>
                    <CoffeeOutlined />
                    <span>餐饮安排</span>
                  </SectionTitle>
                  {renderTags('dining', 2)}
                </FormSection>
                
                <FormSection>
                  <SectionTitle>
                    <CarOutlined />
                    <span>交通安排</span>
                  </SectionTitle>
                  {renderTags('transport', 2)}
                </FormSection>
              </Form>
            </div>
          </HighlightablePanel>
        </StyledCollapse>
        
        <AddButton type="dashed" block icon={<PlusOutlined />} onClick={onToggleRuleView}>
          添加规则
        </AddButton>
      </SchemeCard>
    </div>
  );
};

export default SchemeLane;