import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Button, Input, Avatar, List, Divider } from 'antd';
import { MessageOutlined, MinusOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  margin-bottom: 16px;
`;

const MessageItem = styled.div<{ $isUser: boolean }>`
  display: flex;
  margin-bottom: 16px;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${props => props.$isUser ? '#1890ff' : '#f0f0f0'};
  color: ${props => props.$isUser ? 'white' : 'inherit'};
  margin: 0 8px;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 8px;
  border-top: 1px solid #f0f0f0;
  background: white;
`;

const StyledTextArea = styled(TextArea)`
  resize: none;
  border-radius: 4px;
  margin-right: 8px;
`;

const SendButton = styled(Button)`
  height: auto;
`;

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatPanelProps {
  onMinimize: (isMinimized: boolean) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onMinimize }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: '您好！我是您的智能旅行助手。我可以帮您解决旅行计划中的问题，请问有什么可以帮助您的吗？',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    onMinimize(newState);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    
    // 模拟AI回复
    setTimeout(() => {
      let aiResponse = '';
      
      // 根据用户输入生成不同的回复
      if (inputValue.includes('故宫') && inputValue.includes('周一')) {
        aiResponse = '提示：故宫在周一闭馆，建议您调整行程日期或选择其他景点。';
      } else if (inputValue.includes('预算')) {
        aiResponse = '您的当前行程预算约为6500元，超出了设定的6000元限制。您可以考虑：\n1. 选择经济型餐饮\n2. 使用公共交通代替出租车\n3. 减少一个景点';
      } else if (inputValue.includes('推荐') || inputValue.includes('建议')) {
        aiResponse = '根据您的偏好，我推荐您：\n1. 上午游览故宫\n2. 中午在附近的老舍茶馆用餐\n3. 下午游览景山公园\n4. 晚上可以去王府井步行街体验当地美食。现在请确认你的出发时间？';
      } else {
        aiResponse = '我理解您的需求。请问您需要我帮您调整行程安排，还是提供更多景点信息？';
      }
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
            智能助手
            <Button 
              type="text" 
              icon={<MinusOutlined />}
              onClick={handleMinimize}
            />
          </LaneTitle>
          <ChatCard $isMinimized={isMinimized} bodyStyle={{ padding: '12px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <MessageList>
              {messages.map(message => (
                <MessageItem key={message.id} $isUser={message.isUser}>
                  <Avatar 
                    icon={message.isUser ? <UserOutlined /> : <RobotOutlined />} 
                    style={{ backgroundColor: message.isUser ? '#1890ff' : '#52c41a' }}
                  />
                  <MessageContent $isUser={message.isUser}>
                    {message.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < message.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </MessageContent>
                </MessageItem>
              ))}
              <div ref={messagesEndRef} />
            </MessageList>
            
            <InputContainer>
              <StyledTextArea 
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
              <SendButton 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSendMessage}
              />
            </InputContainer>
          </ChatCard>
        </>
      )}
    </ChatContainer>
  );
};

export default ChatPanel; 