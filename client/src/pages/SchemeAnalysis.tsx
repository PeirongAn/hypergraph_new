import React, { useState } from 'react';
import { Layout, Button, Input } from 'antd';
import { MinusOutlined, ExpandOutlined, SendOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import SchemeLane from '../components/SchemeLane';
import RuleLane from '../components/RuleLane';
import ElementLane from '../components/ElementLane';

const { Sider, Content } = Layout;

const PageLayout = styled(Layout)`
  height: 100%;
`;

const SwimLaneContainer = styled(Content)`
  padding: 20px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChatSider = styled(Sider)`
  background: #fff;
  margin-left: 16px;
  transition: all 0.3s;
`;

const ChatContainer = styled.div`
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ChatInput = styled(Input.TextArea)`
  margin-top: 16px;
  border-radius: 4px;
`;

const SendButton = styled(Button)`
  margin-top: 8px;
  float: right;
`;

const SchemeAnalysis: React.FC = () => {
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  const handleSend = () => {
    if (message.trim()) {
      // 处理发送消息的逻辑
      console.log('发送消息:', message);
      setMessage('');
    }
  };

  return (
    <PageLayout>
      <SwimLaneContainer>
        <SchemeLane />
        <RuleLane />
        <ElementLane />
      </SwimLaneContainer>
      
      <ChatSider 
        width={isChatMinimized ? 50 : 300}
        theme="light"
      >
        {isChatMinimized ? (
          <Button 
            type="text" 
            icon={<ExpandOutlined />} 
            onClick={toggleChat}
            style={{ width: '100%', height: '48px' }}
          />
        ) : (
          <ChatContainer>
            <ChatHeader>
              <h3>智能助手</h3>
              <Button 
                type="text" 
                icon={<MinusOutlined />} 
                onClick={toggleChat}
              />
            </ChatHeader>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
              {/* 聊天消息列表将在这里实现 */}
            </div>
            <div>
              <ChatInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="请输入消息..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <SendButton 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleSend}
              >
                发送
              </SendButton>
            </div>
          </ChatContainer>
        )}
      </ChatSider>
    </PageLayout>
  );
};

export default SchemeAnalysis; 