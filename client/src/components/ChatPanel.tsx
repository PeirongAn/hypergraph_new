import React, { useState } from 'react';
import { Card, Typography, List, Button } from 'antd';
import { MessageOutlined, MinusOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ChatContainer = styled.div<{ $isMinimized: boolean }>`
  position: ${props => props.$isMinimized ? 'fixed' : 'relative'};
  right: ${props => props.$isMinimized ? '24px' : '0'};
  bottom: ${props => props.$isMinimized ? '24px' : '0'};
  width: ${props => props.$isMinimized ? 'auto' : '100%'};
  height: ${props => props.$isMinimized ? '0' : '100%'};
  transition: all 0.3s ease;
  z-index: 1000;
  margin: 0;
  padding: 0;
`;

const MinimizedButton = styled(Button)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  position: absolute;
  right: 0;
  bottom: 0;
`;

const LaneTitle = styled(Title)`
  &.ant-typography {
    font-size: 18px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const ChatCard = styled(Card)<{ $isMinimized: boolean }>`
  display: ${props => props.$isMinimized ? 'none' : 'block'};
  height: calc(100% - 40px);
`;

interface ChatPanelProps {
  onMinimize: (isMinimized: boolean) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onMinimize }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    onMinimize(newState);
  };

  return (
    <ChatContainer $isMinimized={isMinimized}>
      {isMinimized ? (
        <MinimizedButton 
          type="primary"
          icon={<MessageOutlined />}
          onClick={handleMinimize}
        />
      ) : (
        <>
          <LaneTitle level={3}>
            对话窗口
            <Button 
              type="text" 
              icon={<MinusOutlined />}
              onClick={handleMinimize}
            />
          </LaneTitle>
          <ChatCard $isMinimized={isMinimized}>
            <div>
              <Text strong>冲突提示：</Text>
              <p>"故宫周一闭馆"</p>
              
              <Text strong>解决方案：</Text>
              <List>
                <List.Item>1. 调整日期→周二</List.Item>
                <List.Item>2. 替换景点→景山公园</List.Item>
                <List.Item>3. 提高预算→7000元</List.Item>
              </List>
            </div>
          </ChatCard>
        </>
      )}
    </ChatContainer>
  );
};

export default ChatPanel; 