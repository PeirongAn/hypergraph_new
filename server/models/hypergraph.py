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
    """规则类，表示评估要素的规则"""
    def __init__(self, name: str, rule_function: Callable = None, weight: float = 1.0,
                affected_element_keys: List[str] = None, affected_element_types: List[str] = None,
                description: str = "", code: str = "", parameters: Dict[str, Any] = None):
        self.id = f"rule_{uuid4().hex[:8]}"
        self.name = name
        self.rule_function = rule_function
        self.weight = weight
        self.affected_element_keys = affected_element_keys or []
        self.affected_element_types = affected_element_types or []
        self.description = description
        self.code = code
        self.parameters = parameters or {}  # 存储规则的默认参数
    
    def apply(self, element: Dict[str, Any], parameter_values: Dict[str, Any] = None) -> float:
        """应用规则到要素，可以传入参数值"""
        if not self.rule_function:
            return 0.0
        
        # 检查要素类型是否匹配
        if self.affected_element_types and element.get("type") not in self.affected_element_types:
            return 0.0
        
        # 获取要素属性
        attrs = element.get("attributes", {})
        
        # 合并默认参数和传入的参数值
        params = self.parameters.copy()
        if parameter_values:
            params.update(parameter_values)
        
        # 调用规则函数，传入属性和参数
        try:
            return self.rule_function(attrs, params)
        except Exception as e:
            print(f"应用规则 {self.name} 失败: {e}")
            return 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "weight": self.weight,
            "affected_element_keys": self.affected_element_keys,
            "affected_element_types": self.affected_element_types,
            "description": self.description,
            "code": self.code,
            "parameters": self.parameters
        }

class Scheme:
    """方案类，表示一组规则及其权重"""
    def __init__(self, name: str, description: str = "", rule_weights: Dict[str, Any] = None):
        self.id = f"scheme_{uuid4().hex[:8]}"
        self.name = name
        self.description = description
        self.created_at = datetime.now().isoformat()
        self.rule_weights = rule_weights or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """将方案转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at,
            "rule_weights": self.rule_weights
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

    def evaluate_scheme(self, scheme_id: str) -> Dict[str, Any]:
        """评估特定方案"""
        scheme = self.schemes.get(scheme_id)
        if not scheme:
            return {"error": f"方案 {scheme_id} 不存在"}
        
        # 获取所有要素
        elements = list(self.elements.values())
        
        # 评估结果
        selected_elements = []
        total_score = 0.0
        
        # 获取方案使用的规则及其权重
        rule_weights = scheme.rule_weights
        
        for element in elements:
            element_score = 0.0
            element_rule_scores = {}
            
            # 准备要素属性
            element_attrs = element.to_dict()
            
            # 对每个规则进行评估
            for rule_id, weight in rule_weights.items():
                rule = self.rules.get(rule_id)
                if not rule:
                    continue
                    
                # 应用规则
                rule_score = rule.apply(element_attrs)
                if rule_score > 0:
                    # 应用权重
                    weighted_score = rule_score * weight
                    element_score += weighted_score
                    element_rule_scores[rule_id] = weighted_score
            
            if element_score > 0:
                # 创建要素的副本，添加得分信息
                element_copy = element.to_dict()
                element_copy["score"] = element_score
                element_copy["rule_scores"] = element_rule_scores
                
                selected_elements.append(element_copy)
                total_score += element_score
        
        # 返回评估结果
        return {
            "scheme_id": scheme.id,
            "scheme_name": scheme.name,
            "scheme_description": scheme.description,
            "scheme_score": total_score,
            "selected_elements": selected_elements
        }

    def evaluate_all_schemes(self) -> Dict[str, Dict[str, Any]]:
        """评估所有方案"""
        results = {}
        for scheme_id, scheme in self.schemes.items():
            results[scheme_id] = self.evaluate_scheme(scheme_id)
        return results

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
            "element_name": element.get("attributes", element["id"]).get("name", element["id"]),
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

class SchemeRuleHyperedge:
    """方案到规则的超边，表示方案与其使用的规则之间的关系"""
    def __init__(self, scheme_id: str, scheme_name: str):
        self.id = f"scheme_edge_{scheme_id}"
        self.scheme_id = scheme_id
        self.scheme_name = scheme_name
        self.rules = []  # 方案使用的规则列表
    
    def add_rule(self, rule: Dict[str, Any], weight: float):
        """添加方案使用的规则及其权重"""
        self.rules.append({
            "rule_id": rule["id"],
            "rule_name": rule["name"],
            "weight": weight,
            "description": rule.get("description", "")
        })
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme_name,
            "rules_count": len(self.rules),
            "rules": self.rules
        } 