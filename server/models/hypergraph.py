from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Callable, Union, Set
from uuid import uuid4
from datetime import datetime
import json
import textwrap

# 基础模型定义
class Node(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    label: str
    properties: Dict[str, Any] = {}
    
class Edge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    source: str
    target: str
    label: Optional[str] = None
    properties: Dict[str, Any] = {}

class Hyperedge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    nodes: List[str]  # 节点ID列表
    label: Optional[str] = None
    properties: Dict[str, Any] = {}

class LayerBase(BaseModel):
    name: str
    description: Optional[str] = None

class LayerCreate(LayerBase):
    nodes: List[Node] = []
    edges: List[Edge] = []
    hyperedges: List[Hyperedge] = []

class Layer(LayerBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    nodes: List[Node] = []
    edges: List[Edge] = []
    hyperedges: List[Hyperedge] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class LayerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    hyperedges: Optional[List[Hyperedge]] = None

class HypergraphBase(BaseModel):
    name: str
    description: Optional[str] = None

class HypergraphCreate(HypergraphBase):
    layers: List[LayerCreate] = []

class HypergraphUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layers: Optional[List[Layer]] = None

# 核心类定义 - 按依赖顺序排列
class Element:
    """要素类，表示超图底层的基本要素"""
    def __init__(self, element_id: str, element_type: str, attributes: Dict[str, Any]):
        self.id = element_id
        self.type = element_type
        self.attributes = attributes
        self.score = attributes.get("评分", 0)  # 初始得分
        self.rule_scores = {}  # 存储各规则对该要素的评分

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典，避免递归嵌套"""
        # 创建基本结构，不包含 attributes 字段
        result = {
            "id": self.id,
            "type": self.type
        }
        
        # 将属性直接复制到顶层，而不是嵌套在 attributes 中
        if self.attributes:
            for key, value in self.attributes.items():
                # 避免覆盖基本字段
                if key not in result:
                    result[key] = value
        
        # 添加 score 和 rule_scores 字段（如果有）
        if hasattr(self, 'score') and self.score:
            result["score"] = self.score
        
        if hasattr(self, 'rule_scores') and self.rule_scores:
            result["rule_scores"] = self.rule_scores
        
        return result
    
    def __getitem__(self, key):
        """允许使用字典方式访问属性"""
        return self.attributes.get(key)
    
    def get(self, key, default=None):
        """与字典的get方法类似"""
        return self.attributes.get(key, default)

class Rule:
    """规则类，表示对要素属性的约束和计算"""
    def __init__(self, name: str, rule_function: Callable[[Dict[str, Any]], float] = None, 
                 weight: float = 1.0, affected_element_keys: List[str] = None,
                 affected_element_types: List[str] = None,
                 description: str = "", code: str = ""):
        self.id = name.lower().replace(" ", "_")  # 使用名称生成ID
        self.name = name
        self.description = description
        self.weight = weight
        self.affected_element_keys = affected_element_keys or []  # 规则影响的要素属性键
        self.affected_element_types = affected_element_types or []  # 规则影响的要素类型
        self.code = code  # 存储规则的代码字符串，方便前端展示和编辑
        
        # 规则函数：接收要素属性字典，返回规则评分（0表示不满足规则）
        self.rule_function = rule_function or (lambda attrs: 1.0)
    
    def apply(self, element_attributes: Dict[str, Any]) -> float:
        """应用规则到要素属性，返回规则评分"""
        # 如果要素类型不匹配，直接返回0
        element_type = element_attributes.get("type")
        if self.affected_element_types and element_type and element_type not in self.affected_element_types:
            return 0.0
        
        # 准备属性字典，处理可能的递归嵌套
        attrs = self._prepare_attributes(element_attributes)
        
        # 检查要素是否包含所有必需的键
        if self.affected_element_keys:
            if not all(key in attrs for key in self.affected_element_keys):
                return 0.0
        
        # 如果没有规则函数，返回0
        if not self.rule_function:
            return 0.0
        
        try:
            # 应用规则函数并乘以权重
            score = self.rule_function(attrs)
            return score * self.weight if score > 0 else 0.0
        except Exception as e:
            print(f"规则 {self.name} 应用失败: {e}")
            return 0.0
    
    def _prepare_attributes(self, element_attributes: Dict[str, Any]) -> Dict[str, Any]:
        """准备要素属性，处理可能的递归嵌套"""
        # 创建属性字典的副本
        attrs = dict(element_attributes)
        
        # 处理可能的递归嵌套
        if "attributes" in attrs:
            nested_attrs = attrs["attributes"]
            
            # 如果嵌套的 attributes 是字典，则展开它
            if isinstance(nested_attrs, dict):
                # 将嵌套的属性合并到顶层
                for key, value in nested_attrs.items():
                    if key not in attrs or key == "attributes":  # 避免覆盖顶层属性，但允许覆盖 attributes
                        attrs[key] = value
                
                # 如果还有更深层次的嵌套，递归处理
                if "attributes" in nested_attrs and isinstance(nested_attrs["attributes"], dict):
                    deeper_attrs = self._prepare_attributes(nested_attrs)
                    for key, value in deeper_attrs.items():
                        if key not in attrs or key == "attributes":
                            attrs[key] = value
        
        return attrs
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "weight": self.weight,
            "affected_element_keys": self.affected_element_keys,
            "affected_element_types": self.affected_element_types,
            "code": self.code
        }
    
    @classmethod
    def from_dict(cls, rule_dict: Dict[str, Any]) -> 'Rule':
        """从字典创建规则"""
        # 尝试从代码字符串编译规则函数
        rule_function = None
        code = rule_dict.get("code", "")
        if code:
            try:
                # 安全地编译和执行代码
                namespace = {}
                exec(f"def rule_function(attrs):\n{textwrap.indent(code, '    ')}", namespace)
                rule_function = namespace["rule_function"]
            except Exception as e:
                print(f"编译规则代码失败: {e}")
        
        return cls(
            name=rule_dict["name"],
            rule_function=rule_function,
            weight=rule_dict.get("weight", 1.0),
            affected_element_keys=rule_dict.get("affected_element_keys", []),
            affected_element_types=rule_dict.get("affected_element_types", []),
            description=rule_dict.get("description", ""),
            code=code
        )

class Scheme:
    """方案类，表示超图中的评估方案"""
    def __init__(self, name: str, description: str = ""):
        self.id = name.lower().replace(" ", "_")  # 生成方案ID
        self.name = name
        self.description = description
        self.rules: Dict[str, Rule] = {}  # 方案包含的规则
        self.score = 0.0  # 方案得分
        self.selected_elements_count = 0  # 选中的要素数量
    
    def add_rule(self, rule: Rule) -> None:
        """添加规则到方案"""
        self.rules[rule.id] = rule
    
    def evaluate(self, elements: List[Element]) -> Dict[str, Any]:
        """评估方案，计算得分并选择要素"""
        selected_elements = []
        total_score = 0.0
        
        for element in elements:
            element_score = 0.0
            element_rule_scores = {}
            
            # 准备要素属性，包括顶层属性和 attributes 中的属性
            element_attrs = element.to_dict()
            
            # 对每个规则进行评估
            for rule_id, rule in self.rules.items():
                # 应用规则
                rule_score = rule.apply(element_attrs)
                if rule_score > 0:
                    element_score += rule_score
                    element_rule_scores[rule_id] = rule_score
            
            if element_score > 0:
                # 创建要素的副本，添加得分信息
                element_copy = element.to_dict()
                element_copy["score"] = element_score
                element_copy["rule_scores"] = element_rule_scores
                
                selected_elements.append(element_copy)
                total_score += element_score
        
        # 计算方案总得分
        self.score = total_score
        self.selected_elements_count = len(selected_elements)
        
        # 返回评估结果
        return {
            "scheme_id": self.id,
            "scheme_name": self.name,
            "scheme_description": self.description,
            "scheme_score": self.score,
            "selected_elements": selected_elements
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """将方案转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "rules": [rule.to_dict() for rule in self.rules.values()],
            "score": self.score,
            "selected_elements_count": self.selected_elements_count
        }

class Hypergraph:
    """超图类，表示整个超图结构"""
    def __init__(self, name: str, description: str = ""):
        self.id = str(uuid4())
        self.name = name
        self.description = description
        self.schemes: Dict[str, Scheme] = {}  # 方案字典，按ID索引
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def add_scheme(self, scheme: Scheme) -> None:
        """添加方案到超图"""
        self.schemes[scheme.id] = scheme
        self.updated_at = datetime.now()
    
    def get_scheme(self, scheme_id: str) -> Optional[Scheme]:
        """获取特定方案"""
        return self.schemes.get(scheme_id)
    
    def to_dict(self) -> Dict[str, Any]:
        """将超图转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "schemes_count": len(self.schemes),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def get_all_schemes(self) -> List[Dict[str, Any]]:
        """获取所有方案"""
        return [scheme.to_dict() for scheme in self.schemes.values()]

class HypergraphLayer:
    """超图层，表示超图的一个层次"""
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.id = name.lower().replace(" ", "_")  # 生成层ID

class Hypergraph:
    """分层超图类，包含三个层次：要素层、规则层、方案层"""
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
        self.id = name.lower().replace(" ", "_")  # 生成超图ID
        
        # 初始化三个层
        self.element_layer = HypergraphLayer("要素层", "底层要素")
        self.rule_layer = HypergraphLayer("规则层", "中层规则")
        self.scheme_layer = HypergraphLayer("方案层", "上层方案")
        
        # 存储数据
        self.elements: Dict[str, Element] = {}  # 要素字典，键为要素ID
        self.elements_by_type: Dict[str, List[Element]] = {}  # 按类型分组的要素
        self.rules: Dict[str, Rule] = {}  # 规则字典，键为规则ID
        self.schemes: Dict[str, Scheme] = {}  # 方案字典，键为方案ID
    
    def add_element(self, element_id: str, element_type: str, attributes: Dict[str, Any]) -> Element:
        """添加要素"""
        element = Element(element_id, element_type, attributes)
        self.elements[element_id] = element
        
        # 按类型分组
        if element_type not in self.elements_by_type:
            self.elements_by_type[element_type] = []
        self.elements_by_type[element_type].append(element)
        
        return element
    
    def add_elements_from_dict(self, elements_dict: Dict[str, List[Dict[str, Any]]]) -> None:
        """从字典批量添加要素"""
        for element_type, elements_list in elements_dict.items():
            for element_data in elements_list:
                element_id = element_data.get("id")
                if not element_id:
                    continue
                self.add_element(element_id, element_type, element_data)
    
    def add_rule(self, rule: Rule) -> None:
        """添加规则"""
        self.rules[rule.id] = rule
    
    def add_scheme(self, scheme: Scheme) -> None:
        """添加方案"""
        self.schemes[scheme.id] = scheme
    
    def evaluate_scheme(self, scheme_id: str) -> Dict[str, Any]:
        """评估特定方案"""
        scheme = self.schemes.get(scheme_id)
        if not scheme:
            return {"error": f"方案 {scheme_id} 不存在"}
        
        # 获取所有要素
        elements = list(self.elements.values())
        
        # 评估方案
        return scheme.evaluate(elements)
    
    def evaluate_all_schemes(self) -> Dict[str, Dict[str, Any]]:
        """评估所有方案"""
        results = {}
        for scheme_id, scheme in self.schemes.items():
            results[scheme_id] = self.evaluate_scheme(scheme_id)
        return results
    
    def to_dict(self) -> Dict[str, Any]:
        """将超图转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "elements_count": len(self.elements),
            "rules_count": len(self.rules),
            "schemes_count": len(self.schemes),
            "element_types": list(self.elements_by_type.keys())
        }
    
    def get_elements_by_type(self, element_type: str) -> List[Dict[str, Any]]:
        """获取特定类型的所有要素"""
        elements = self.elements_by_type.get(element_type, [])
        return [e.to_dict() for e in elements]
    
    def get_all_elements(self) -> Dict[str, List[Dict[str, Any]]]:
        """获取所有要素，按类型分组"""
        result = {}
        for element_type, elements in self.elements_by_type.items():
            result[element_type] = [e.to_dict() for e in elements]
        return result
    
    def get_all_rules(self) -> List[Dict[str, Any]]:
        """获取所有规则"""
        return [rule.to_dict() for rule in self.rules.values()]
    
    def get_all_schemes(self) -> List[Dict[str, Any]]:
        """获取所有方案"""
        return [scheme.to_dict() for scheme in self.schemes.values()]

class RuleElementHyperedge:
    """规则到要素的超边，表示规则与满足该规则的要素之间的关系"""
    def __init__(self, rule_id: str, rule_name: str):
        self.id = f"rule_edge_{rule_id}"
        self.rule_id = rule_id
        self.rule_name = rule_name
        self.elements = []  # 满足规则的要素列表
        self.score = 0.0    # 规则的总得分
    
    def add_element(self, element: Dict[str, Any], score: float):
        """添加满足规则的要素及其得分"""
        self.elements.append({
            "element_id": element["id"],
            "element_name": element.get("name", element["id"]),
            "element_type": element["type"],
            "score": score
        })
        self.score += score
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "rule_id": self.rule_id,
            "rule_name": self.rule_name,
            "elements_count": len(self.elements),
            "elements": self.elements,
            "total_score": self.score
        } 