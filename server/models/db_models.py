from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class ElementDB(BaseModel):
    """数据库中的要素模型"""
    id: str
    type: str
    attributes: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class RuleDB(BaseModel):
    """数据库中的规则模型"""
    id: str
    name: str
    weight: float
    affected_element_keys: List[str] = []  # 规则影响的要素属性键
    affected_element_types: List[str] = []
    description: str = ""
    code: str = ""  # 存储规则的代码
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    # 注意：条件和评分函数无法直接存储在数据库中，需要在代码中定义

class ElementCreate(BaseModel):
    """创建要素的请求模型"""
    id: str
    type: str
    attributes: Dict[str, Any]

class ElementUpdate(BaseModel):
    """更新要素的请求模型"""
    attributes: Dict[str, Any]

class RuleCreate(BaseModel):
    """创建规则的请求模型"""
    name: str
    weight: float = 1.0
    affected_element_types: List[str]

class RuleUpdate(BaseModel):
    """更新规则的请求模型"""
    name: Optional[str] = None
    weight: Optional[float] = None
    affected_element_types: Optional[List[str]] = None 