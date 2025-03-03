import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// WebSocket连接
let socket: Socket;

export const connectWebSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL);
    
    socket.on('connect', () => {
      console.log('WebSocket连接成功');
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket连接断开');
    });
  }
  
  return socket;
};

// 超图API
export const hypergraphApi = {
  // 获取所有超图
  getAllHypergraphs: async () => {
    const response = await api.get('/api/hypergraph');
    return response.data;
  },
  
  // 获取特定超图
  getHypergraphById: async (id: string) => {
    const response = await api.get(`/api/hypergraph/${id}`);
    return response.data;
  },
  
  // 创建新超图
  createHypergraph: async (hypergraphData: any) => {
    const response = await api.post('/api/hypergraph', hypergraphData);
    return response.data;
  },
  
  // 删除超图
  deleteHypergraph: async (id: string) => {
    const response = await api.delete(`/api/hypergraph/${id}`);
    return response.data;
  },
  
  // 获取超图的所有要素
  getAllElements: async (hypergraphId: string) => {
    const response = await api.get(`/api/hypergraph/${hypergraphId}/elements`);
    return response.data;
  },
  
  // 获取超图的特定类型要素
  getElementsByType: async (hypergraphId: string, elementType: string) => {
    const response = await api.get(`/api/hypergraph/${hypergraphId}/elements/${elementType}`);
    return response.data;
  },
  
  // 获取超图的所有规则
  getAllRules: async () => {
    const response = await api.get(`/api/hypergraph/rules`);
    return response.data;
  },
  
  // 获取超图的所有方案
  getAllSchemes: async (hypergraphId: string) => {
    const response = await api.get(`/api/hypergraph/${hypergraphId}/schemes`);
    return response.data;
  },
  
  // 评估超图的特定方案
  evaluateScheme: async (hypergraphId: string, schemeId: string) => {
    const response = await api.get(`/api/hypergraph/${hypergraphId}/schemes/${schemeId}/evaluate`);
    return response.data;
  },
  
  // 评估超图的所有方案
  evaluateAllSchemes: async (hypergraphId: string) => {
    const response = await api.get(`/api/hypergraph/${hypergraphId}/schemes/evaluate-all`);
    return response.data;
  },
  
  // 获取所有共享要素
  getAllSharedElements: async () => {
    const response = await api.get('/api/hypergraph/elements');
    return response.data;
  },
  
  // 获取特定类型的共享要素
  getSharedElementsByType: async (elementType: string) => {
    const response = await api.get(`/api/hypergraph/elements/${elementType}`);
    return response.data;
  },
  
  // 获取所有共享规则
  getAllSharedRules: async () => {
    const response = await api.get('/api/hypergraph/rules');
    return response.data;
  },
  
  // 创建新共享要素
  createSharedElement: async (elementData: any) => {
    const response = await api.post('/api/hypergraph/elements', elementData);
    return response.data;
  },
  
  // 更新共享要素
  updateSharedElement: async (elementId: string, elementData: any) => {
    const response = await api.put(`/api/hypergraph/elements/${elementId}`, elementData);
    return response.data;
  },
  
  // 删除共享要素
  deleteSharedElement: async (elementId: string) => {
    const response = await api.delete(`/api/hypergraph/elements/${elementId}`);
    return response.data;
  },
  
  // 创建新共享规则
  createSharedRule: async (ruleData: any) => {
    const response = await api.post('/api/hypergraph/rules', ruleData);
    return response.data;
  },
  
  // 更新共享规则
  updateSharedRule: async (ruleId: string, ruleData: any) => {
    // 确保 ruleId 正确编码
    const encodedRuleId = encodeURIComponent(ruleId);
    const response = await api.put(`/api/hypergraph/rules/${encodedRuleId}`, ruleData);
    return response.data;
  },
  
  // 删除共享规则
  deleteSharedRule: async (ruleId: string) => {
    // 确保 ruleId 正确编码
    const encodedRuleId = encodeURIComponent(ruleId);
    const response = await api.delete(`/api/hypergraph/rules/${encodedRuleId}`);
    return response.data;
  },
  
  // 获取规则到要素的超边
  getRuleElementHyperedges: async () => {
    const response = await api.get('/api/hypergraph/rule-element-hyperedges');
    return response.data;
  },
};

export default api;