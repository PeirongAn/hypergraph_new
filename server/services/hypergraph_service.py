from typing import List, Optional, Dict, Any, Callable, Set
from models.hypergraph import Hypergraph, HypergraphCreate, HypergraphUpdate, Layer, LayerCreate, LayerUpdate, Rule, Scheme, Element, RuleElementHyperedge, SchemeRuleHyperedge
from datetime import datetime
import uuid
import json
import asyncio
from services.db_service import DatabaseService
import textwrap
import time

class HypergraphService:
    def __init__(self):
        # 在实际应用中，这里应该连接到数据库
        # 这里使用内存存储作为示例
        self.hypergraphs: Dict[str, Hypergraph] = {}
        
        # 共享的要素层和规则层
        self.shared_elements: Dict[str, Element] = {}  # 所有要素的字典，按ID索引
        self.shared_elements_by_type: Dict[str, List[Element]] = {}  # 按类型分组的要素
        self.shared_rules: Dict[str, Rule] = {}  # 所有规则的字典，按ID索引
        
        # 初始化共享要素和规则
        self._initialize_shared_elements_and_rules()
    
    def _initialize_shared_elements_and_rules(self):
        """初始化共享的要素和规则"""
        # 初始化要素
        elements = {
            "景点": [
                {"id": "A1", "name": "故宫", "季节": ["春", "秋"], "价格": 60, "评分": 4.8},
                {"id": "A2", "name": "长城", "季节": ["春", "秋", "冬"], "价格": 40, "评分": 4.5},
                {"id": "A3", "name": "颐和园", "季节": ["春", "夏"], "价格": 30, "评分": 4.6},
                {"id": "A4", "name": "天坛", "季节": ["春", "夏", "秋"], "价格": 35, "评分": 4.4},
                {"id": "A5", "name": "北海公园", "季节": ["春", "夏", "秋"], "价格": 20, "评分": 4.3},
            ],
            "美食": [
                {"id": "F1", "name": "烤鸭店", "人均消费": 120, "评分": 4.7, "标签": ["本地特色"]},
                {"id": "F2", "name": "火锅店", "人均消费": 80, "评分": 4.3, "标签": ["辣"]},
                {"id": "F3", "name": "面馆", "人均消费": 40, "评分": 4.5, "标签": ["面食", "本地特色"]},
                {"id": "F4", "name": "小吃街", "人均消费": 60, "评分": 4.6, "标签": ["小吃", "本地特色"]},
                {"id": "F5", "name": "海鲜餐厅", "人均消费": 150, "评分": 4.4, "标签": ["海鲜"]},
            ],
            "住宿": [
                {"id": "H1", "name": "经济酒店", "价格": 300, "距离地铁": 500, "评分": 4.0},
                {"id": "H2", "name": "豪华酒店", "价格": 1000, "距离地铁": 2000, "评分": 4.8},
                {"id": "H3", "name": "青年旅舍", "价格": 150, "距离地铁": 800, "评分": 4.2},
                {"id": "H4", "name": "商务酒店", "价格": 600, "距离地铁": 300, "评分": 4.5},
                {"id": "H5", "name": "度假村", "价格": 1200, "距离地铁": 5000, "评分": 4.9},
            ]
        }
        
        # 添加要素到共享存储
        for element_type, element_list in elements.items():
            if element_type not in self.shared_elements_by_type:
                self.shared_elements_by_type[element_type] = []
                
            for element_data in element_list:
                element_id = element_data["id"]
                element = Element(element_id, element_type, element_data)
                self.shared_elements[element_id] = element
                self.shared_elements_by_type[element_type].append(element)
        
        # 初始化规则 - 使用新的函数式规则
        
        # 1. 季节匹配规则（秋季）
        rule_season = Rule(
            name="季节匹配",
            rule_function=lambda attrs: 1.0 if "秋" in attrs.get("季节", []) else 0.0,
            weight=1.0,
            affected_element_keys=["季节"],
            affected_element_types=["景点"],
            description="匹配适合秋季游览的景点",
            code="if '秋' in attrs.get('季节', []):\n    return 1.0\nreturn 0.0"
        )
        self.shared_rules["rule_season"] = rule_season
        
        # 2. 经济型住宿规则
        rule_budget = Rule(
            name="经济型住宿",
            rule_function=lambda attrs: 1.0 if attrs.get("价格", 0) < 500 else 0.0,
            weight=1.0,
            affected_element_keys=["价格"],
            affected_element_types=["住宿"],
            description="选择价格低于500元的经济型住宿",
            code="if attrs.get('价格', 0) < 500:\n    return 1.0\nreturn 0.0"
        )
        self.shared_rules["rule_budget"] = rule_budget
        
        # 3. 高评分规则
        rule_rating = Rule(
            name="高评分",
            rule_function=lambda attrs: attrs.get("评分", 0) if attrs.get("评分", 0) >= 4.5 else 0.0,
            weight=1.5,
            affected_element_keys=["评分"],
            affected_element_types=["景点", "美食", "住宿"],
            description="选择评分高于4.5的高品质选项",
            code="rating = attrs.get('评分', 0)\nif rating >= 4.5:\n    return rating\nreturn 0.0"
        )
        self.shared_rules["rule_rating"] = rule_rating
        
        # 4. 本地特色美食规则
        rule_local_food = Rule(
            name="本地特色美食",
            rule_function=lambda attrs: 1.2 if "本地特色" in attrs.get("标签", []) else 0.0,
            weight=1.2,
            affected_element_keys=["标签"],
            affected_element_types=["美食"],
            description="选择具有本地特色的美食",
            code="if '本地特色' in attrs.get('标签', []):\n    return 1.2\nreturn 0.0"
        )
        self.shared_rules["rule_local_food"] = rule_local_food
        
        # 5. 交通便利规则
        rule_transport = Rule(
            name="交通便利",
            rule_function=lambda attrs: 1.0 if attrs.get("距离地铁", 10000) < 1000 else 0.0,
            weight=0.8,
            affected_element_keys=["距离地铁"],
            affected_element_types=["住宿"],
            description="选择距离地铁站近的住宿",
            code="if attrs.get('距离地铁', 10000) < 1000:\n    return 1.0\nreturn 0.0"
        )
        self.shared_rules["rule_transport"] = rule_transport
    
    # 添加缓存
    _rules_cache = None
    _rules_cache_timestamp = 0
    _CACHE_DURATION = 60  # 缓存有效期，单位秒
    
    async def get_all_rules_async(self) -> List[Dict[str, Any]]:
        """异步获取所有共享规则（带缓存）"""
        current_time = time.time()
        
        # 如果缓存存在且未过期，直接返回缓存数据
        if self._rules_cache is not None and (current_time - self._rules_cache_timestamp) < self._CACHE_DURATION:
            return self._rules_cache
        
        # 否则从数据库获取
        rules = await DatabaseService.get_all_rules()
        
        # 更新缓存
        self._rules_cache = rules
        self._rules_cache_timestamp = current_time
        
        return rules
    
    # 异步方法 - 使用数据库服务
    
    async def get_all_elements_async(self) -> Dict[str, List[Dict[str, Any]]]:
        """异步获取所有共享要素"""
        return await DatabaseService.get_all_elements()
    
    async def get_elements_by_type_async(self, element_type: str) -> List[Dict[str, Any]]:
        """异步获取特定类型的共享要素"""
        return await DatabaseService.get_elements_by_type(element_type)
    
    async def create_element_async(self, element_id: str, element_type: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """异步创建新的共享要素"""
        element_data = {
            "id": element_id,
            "type": element_type,
            "attributes": attributes
        }
        return await DatabaseService.create_element(element_data)
    
    async def update_element_async(self, element_id: str, attributes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """异步更新共享要素"""
        return await DatabaseService.update_element(element_id, attributes)
    
    async def delete_element_async(self, element_id: str) -> bool:
        """异步删除共享要素"""
        return await DatabaseService.delete_element(element_id)
    
    async def create_rule_async(self, name: str, weight: float = 1.0, 
                               affected_element_types: List[str] = None,
                               affected_element_keys: List[str] = None,
                               description: str = "", code: str = "") -> Dict[str, Any]:
        """异步创建新的共享规则"""
        rule_data = {
            "name": name,
            "weight": weight,
            "affected_element_types": affected_element_types or [],
            "affected_element_keys": affected_element_keys or [],
            "description": description,
            "code": code
        }
        return await DatabaseService.create_rule(rule_data)
    
    async def update_rule_async(self, rule_id: str, rule_data: Any) -> Optional[Dict[str, Any]]:
        """异步更新共享规则"""
        update_data = {}
        
        if hasattr(rule_data, "name") and rule_data.name is not None:
            update_data["name"] = rule_data.name
        
        if hasattr(rule_data, "weight") and rule_data.weight is not None:
            update_data["weight"] = rule_data.weight
        
        if hasattr(rule_data, "affected_element_types") and rule_data.affected_element_types is not None:
            update_data["affected_element_types"] = rule_data.affected_element_types
        
        if hasattr(rule_data, "affected_element_keys") and rule_data.affected_element_keys is not None:
            update_data["affected_element_keys"] = rule_data.affected_element_keys
        
        if hasattr(rule_data, "description") and rule_data.description is not None:
            update_data["description"] = rule_data.description
        
        if hasattr(rule_data, "code") and rule_data.code is not None:
            update_data["code"] = rule_data.code
        
        return await DatabaseService.update_rule(rule_id, update_data)
    
    async def delete_rule_async(self, rule_id: str) -> bool:
        """异步删除共享规则"""
        return await DatabaseService.delete_rule(rule_id)
    
    # 同步方法包装异步方法（用于兼容现有代码）
    
    def get_all_elements(self) -> Dict[str, List[Dict[str, Any]]]:
        """获取所有共享要素"""
        # 首先尝试从数据库获取
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.get_all_elements_async())
        except Exception as e:
            print(f"从数据库获取要素失败: {e}")
            # 如果失败，回退到内存存储
            result = {}
            for element_type, elements in self.shared_elements_by_type.items():
                result[element_type] = [e.to_dict() for e in elements]
            return result
    
    def get_elements_by_type(self, element_type: str) -> List[Dict[str, Any]]:
        """获取特定类型的共享要素"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.get_elements_by_type_async(element_type))
        except Exception as e:
            print(f"从数据库获取要素失败: {e}")
            elements = self.shared_elements_by_type.get(element_type, [])
            return [e.to_dict() for e in elements]
    
    def create_element(self, element_id: str, element_type: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
        """创建新的共享要素"""
        # 同步调用异步方法
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.create_element_async(element_id, element_type, attributes))
        except Exception as e:
            print(f"创建要素失败: {e}")
            # 回退到内存存储
            element = Element(element_id, element_type, attributes)
            self.shared_elements[element_id] = element
            
            if element_type not in self.shared_elements_by_type:
                self.shared_elements_by_type[element_type] = []
            self.shared_elements_by_type[element_type].append(element)
            
            return element.to_dict()
    
    def update_element(self, element_id: str, attributes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新共享要素"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.update_element_async(element_id, attributes))
        except Exception as e:
            print(f"更新要素失败: {e}")
            # 回退到内存存储
            if element_id not in self.shared_elements:
                return None
            
            element = self.shared_elements[element_id]
            
            # 更新属性
            for key, value in attributes.items():
                element.attributes[key] = value
            
            return element.to_dict()
    
    def delete_element(self, element_id: str) -> bool:
        """删除共享要素"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.delete_element_async(element_id))
        except Exception as e:
            print(f"删除要素失败: {e}")
            # 回退到内存存储
            if element_id not in self.shared_elements:
                return False
            
            element = self.shared_elements[element_id]
            
            # 从类型分组中删除
            if element.type in self.shared_elements_by_type:
                self.shared_elements_by_type[element.type] = [
                    e for e in self.shared_elements_by_type[element.type] if e.id != element_id
                ]
            
            # 从主字典中删除
            del self.shared_elements[element_id]
            
            return True
    
    def get_all_rules(self) -> List[Dict[str, Any]]:
        """同步获取所有共享规则（用于非异步上下文）"""
        # 直接返回共享规则的字典值列表
        return [rule.to_dict() for rule in self.shared_rules.values()]
    
    def create_rule(self, name: str, weight: float = 1.0, affected_element_types: List[str] = None) -> Dict[str, Any]:
        """创建新的共享规则"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.create_rule_async(name, weight, affected_element_types))
        except Exception as e:
            print(f"创建规则失败: {e}")
            # 回退到内存存储
            rule_id = name.lower().replace(" ", "_")
            
            # 创建新规则（使用简单的条件和评分函数）
            rule = Rule(
                name=name,
                condition=lambda elem: True,  # 默认条件：总是满足
                weight=weight,
                affected_element_types=affected_element_types or []
            )
            
            self.shared_rules[rule_id] = rule
            return rule.to_dict()
    
    def update_rule(self, rule_id: str, rule_data: Any) -> Optional[Dict[str, Any]]:
        """更新共享规则"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.update_rule_async(rule_id, rule_data))
        except Exception as e:
            print(f"更新规则失败: {e}")
            # 回退到内存存储
            # 尝试直接查找规则
            if rule_id in self.shared_rules:
                rule = self.shared_rules[rule_id]
            else:
                # 尝试查找规则名称匹配的规则
                matching_rules = [r for r in self.shared_rules.values() if r.name == rule_id]
                if matching_rules:
                    rule = matching_rules[0]
                    rule_id = rule.id
                else:
                    # 尝试将规则名称转换为ID格式
                    converted_id = rule_id.lower().replace(" ", "_")
                    if converted_id in self.shared_rules:
                        rule = self.shared_rules[converted_id]
                        rule_id = converted_id
                    else:
                        return None
            
            # 更新规则属性
            if rule_data.name is not None:
                rule.name = rule_data.name
            
            if rule_data.weight is not None:
                rule.weight = rule_data.weight
            
            if rule_data.affected_element_types is not None:
                rule.affected_element_types = rule_data.affected_element_types
            
            return rule.to_dict()
    
    def delete_rule(self, rule_id: str) -> bool:
        """删除共享规则"""
        try:
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.delete_rule_async(rule_id))
        except Exception as e:
            print(f"删除规则失败: {e}")
            # 回退到内存存储
            # 尝试直接查找规则
            if rule_id in self.shared_rules:
                del self.shared_rules[rule_id]
                return True
            else:
                # 尝试查找规则名称匹配的规则
                matching_rules = [r for r in self.shared_rules.values() if r.name == rule_id]
                if matching_rules:
                    rule = matching_rules[0]
                    del self.shared_rules[rule.id]
                    return True
                else:
                    # 尝试将规则名称转换为ID格式
                    converted_id = rule_id.lower().replace(" ", "_")
                    if converted_id in self.shared_rules:
                        del self.shared_rules[converted_id]
                        return True
            
            return False
    
    # 超图相关方法
    
    def create_demo_hypergraph(self) -> Hypergraph:
        """创建演示超图"""
        # 创建超图
        hypergraph = Hypergraph("旅游规划超图", "演示用的旅游规划超图")
        
        # 添加要素
        for element_id, element in self.shared_elements.items():
            hypergraph.add_element(element_id, element.type, element.attributes)
        
        # 添加规则
        for rule_id, rule in self.shared_rules.items():
            hypergraph.add_rule(rule)
        
        # 创建方案1：经济型旅游
        scheme1 = Scheme(
            name="经济型旅游", 
            description="适合预算有限的旅游者",
            rule_weights={
                "rule_budget": 2.0,
                "rule_season": 1.0,
                "rule_transport": 1.5
            }
        )
        hypergraph.add_scheme(scheme1)
        
        # 创建方案2：高品质旅游
        scheme2 = Scheme(
            name="高品质旅游", 
            description="追求高品质体验的旅游者",
            rule_weights={
                "rule_rating": 2.0,
                "rule_local_food": 1.5
            }
        )
        hypergraph.add_scheme(scheme2)
        
        # 创建方案3：综合旅游
        scheme3 = Scheme(
            name="综合旅游", 
            description="平衡各方面因素的综合旅游方案",
            rule_weights={
                "rule_budget": 1.0,
                "rule_rating": 1.0,
                "rule_season": 1.0,
                "rule_local_food": 1.0,
                "rule_transport": 1.0
            }
        )
        hypergraph.add_scheme(scheme3)
        
        # 保存超图
        self.hypergraphs[hypergraph.id] = hypergraph
        
        return hypergraph
    
    def get_all_hypergraphs(self) -> List[Dict[str, Any]]:
        """获取所有超图"""
        return [hypergraph.to_dict() for hypergraph in self.hypergraphs.values()]
    
    def get_hypergraph(self, hypergraph_id: str) -> Optional[Hypergraph]:
        """获取特定超图"""
        return self.hypergraphs.get(hypergraph_id)
    
    def create_hypergraph(self, hypergraph_data: HypergraphCreate) -> Hypergraph:
        """创建新超图"""
        hypergraph = Hypergraph(
            name=hypergraph_data.name,
            description=hypergraph_data.description
        )
        
        # 存储超图
        self.hypergraphs[hypergraph.id] = hypergraph
        
        return hypergraph
    
    def update_hypergraph(self, hypergraph_id: str, hypergraph_data: HypergraphUpdate) -> Optional[Hypergraph]:
        """更新超图"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        # 更新属性
        if hypergraph_data.name:
            hypergraph.name = hypergraph_data.name
        
        if hypergraph_data.description:
            hypergraph.description = hypergraph_data.description
        
        return hypergraph
    
    def delete_hypergraph(self, hypergraph_id: str) -> bool:
        """删除超图"""
        if hypergraph_id not in self.hypergraphs:
            return False
        
        # 从字典中删除
        del self.hypergraphs[hypergraph_id]
        
        return True
    
    def evaluate_scheme(self, hypergraph_id: str, scheme_id: str) -> Dict[str, Any]:
        """评估特定方案"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return {"error": f"超图 {hypergraph_id} 不存在"}
        
        return hypergraph.evaluate_scheme(scheme_id)
    
    def evaluate_all_schemes(self, hypergraph_id: str) -> Dict[str, Dict[str, Any]]:
        """评估所有方案"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return {"error": f"超图 {hypergraph_id} 不存在"}
        
        return hypergraph.evaluate_all_schemes()

    def get_hypergraph_layer(self, hypergraph_id: str, layer_id: str) -> Optional[Layer]:
        """获取超图的特定层"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        for layer in hypergraph.layers:
            if layer.id == layer_id:
                return layer
        
        return None
    
    def add_layer_to_hypergraph(self, hypergraph_id: str, layer_data: LayerCreate) -> Optional[Hypergraph]:
        """添加新层到超图"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        # 创建新层
        layer_id = str(uuid.uuid4())
        layer = Layer(
            id=layer_id,
            name=layer_data.name,
            description=layer_data.description,
            nodes=layer_data.nodes,
            edges=layer_data.edges,
            hyperedges=layer_data.hyperedges,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # 添加到超图
        hypergraph.layers.append(layer)
        hypergraph.updated_at = datetime.now()
        
        return hypergraph
    
    def update_hypergraph_layer(self, hypergraph_id: str, layer_id: str, layer_data: LayerUpdate) -> Optional[Hypergraph]:
        """更新超图中的层"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        # 查找并更新层
        for i, layer in enumerate(hypergraph.layers):
            if layer.id == layer_id:
                if layer_data.name is not None:
                    layer.name = layer_data.name
                
                if layer_data.description is not None:
                    layer.description = layer_data.description
                
                if layer_data.nodes is not None:
                    layer.nodes = layer_data.nodes
                
                if layer_data.edges is not None:
                    layer.edges = layer_data.edges
                
                if layer_data.hyperedges is not None:
                    layer.hyperedges = layer_data.hyperedges
                
                layer.updated_at = datetime.now()
                hypergraph.updated_at = datetime.now()
                
                return hypergraph
        
        return None
    
    def delete_hypergraph_layer(self, hypergraph_id: str, layer_id: str) -> Optional[Hypergraph]:
        """删除超图中的层"""
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        # 查找并删除层
        for i, layer in enumerate(hypergraph.layers):
            if layer.id == layer_id:
                hypergraph.layers.pop(i)
                hypergraph.updated_at = datetime.now()
                return hypergraph
        
        return None
    
    async def calculate_rule_element_hyperedges(self) -> List[Dict[str, Any]]:
        """计算规则到要素的超边，表示每个规则影响的所有要素"""
        print("开始计算规则到要素的超边...")
        
        # 获取所有规则和要素
        rules = await self.get_all_rules_async()
        elements_by_type = await self.get_all_elements_async()
        
        print(f"获取到 {len(rules)} 个规则和 {sum(len(elements) for elements in elements_by_type.values())} 个要素")
        
        # 将所有要素放入一个列表
        all_elements = []
        for element_list in elements_by_type.values():
            all_elements.extend(element_list)
        # 创建超边列表
        hyperedges = []
        
        # 对每个规则，计算其影响的要素
        for rule_data in rules:
            rule_id = rule_data["id"]
            rule_name = rule_data["name"]
            
            print(f"处理规则: {rule_name} (ID: {rule_id})")
            
            # 创建规则对象
            rule_function = None
            if "code" in rule_data and rule_data["code"]:
                try:
                    # 编译规则代码
                    code = rule_data["code"]
                    print(f"规则代码: {code}")
                    
                    # 创建规则函数
                    rule_function = self.create_rule_function(code)
                except Exception as e:
                    print(f"编译规则 {rule_id} 代码失败: {e}")
                    continue
            
            # 创建规则对象
            rule = Rule(
                name=rule_data["name"],
                rule_function=rule_function,
                weight=rule_data.get("weight", 1.0),
                affected_element_keys=rule_data.get("affected_element_keys", []),
                affected_element_types=rule_data.get("affected_element_types", []),
                description=rule_data.get("description", ""),
                code=rule_data.get("code", "")
            )
            
            # 创建超边
            hyperedge = RuleElementHyperedge(rule_id, rule_name)
            
            # 对每个要素，检查是否满足规则
            matched_elements = 0
            for element in all_elements:
                # 应用规则
                score = rule.apply(element)
                
                # 如果得分大于0，则要素满足规则
                if score > 0:
                    hyperedge.add_element(element, score)
                    matched_elements += 1
            
            print(f"规则 {rule_name} 匹配到 {matched_elements} 个要素")
            
            # 如果超边包含要素，则添加到列表
            if hyperedge.elements:
                hyperedges.append(hyperedge.to_dict())
        
        print(f"计算完成，共生成 {len(hyperedges)} 个超边")
        return hyperedges

    def create_rule_function(self, code_str):
        """创建规则函数，接受规则代码字符串，返回一个函数"""
        try:
            # 将代码包装在函数中
            wrapped_code = f"""
def rule_function(attrs):
{textwrap.indent(code_str, '    ')}
"""
            # 创建一个局部命名空间
            local_vars = {}
            
            # 执行包装后的代码，定义函数
            exec(wrapped_code, {}, local_vars)
            
            # 返回定义的函数
            return local_vars["rule_function"]
        except Exception as e:
            print(f"创建规则函数失败: {e}")
            return lambda attrs: 0.0

    async def calculate_scheme_rule_hyperedges(self) -> List[Dict[str, Any]]:
        """计算方案到规则的超边，表示每个方案使用的所有规则"""
        print("开始计算方案到规则的超边...")
        
        # 获取所有超图
        hypergraphs = self.get_all_hypergraphs()
        
        # 获取所有规则
        rules = await self.get_all_rules_async()
        rules_dict = {rule["id"]: rule for rule in rules}
        
        # 创建超边列表
        hyperedges = []
        
        # 对每个超图
        for hypergraph in hypergraphs:
            hypergraph_obj = self.get_hypergraph(hypergraph["id"])
            if not hypergraph_obj:
                continue
            
            # 获取所有方案
            schemes = hypergraph_obj.get_all_schemes()
            
            # 对每个方案，创建超边
            for scheme in schemes:
                scheme_id = scheme["id"]
                scheme_name = scheme["name"]
                
                print(f"处理方案: {scheme_name} (ID: {scheme_id})")
                
                # 创建超边
                hyperedge = SchemeRuleHyperedge(scheme_id, scheme_name)
                
                # 添加方案使用的规则
                for rule_id, weight in scheme.get("rule_weights", {}).items():
                    if rule_id in rules_dict:
                        hyperedge.add_rule(rules_dict[rule_id], weight)
                
                # 如果超边包含规则，则添加到列表
                if hyperedge.rules:
                    hyperedges.append(hyperedge.to_dict())
        
        print(f"计算完成，共生成 {len(hyperedges)} 个超边")
        return hyperedges

    def create_scheme(self, hypergraph_id: str, name: str, description: str = "", rule_weights: Dict[str, float] = None) -> Optional[Dict[str, Any]]:
        """创建新方案"""
        # 检查超图是否存在
        hypergraph = self.get_hypergraph(hypergraph_id)
        if not hypergraph:
            return None
        
        # 创建方案对象
        scheme = Scheme(name, description, rule_weights)
        
        # 添加到超图
        hypergraph.add_scheme(scheme)
        
        return scheme.to_dict()

    async def create_scheme_standalone(self, name: str, description: str = "", rule_weights: Dict[str, float] = None) -> Optional[Dict[str, Any]]:
        """创建独立的方案，不关联到特定超图"""
        # 创建方案对象
        scheme = Scheme(name, description, rule_weights)
        
        # 将方案存储在服务中
        if not hasattr(self, 'standalone_schemes'):
            self.standalone_schemes = {}
        
        self.standalone_schemes[scheme.id] = scheme
        
        # 计算该方案的规则-要素超边
        scheme_rule_hyperedge = None
        rule_element_hyperedges = []
        
        # 获取所有规则
        rules = await self.get_all_rules_async()
        rules_dict = {rule["id"]: rule for rule in rules}
        
        # 创建方案-规则超边
        if rule_weights:
            scheme_rule_hyperedge = SchemeRuleHyperedge(scheme.id, scheme.name)
            
            # 添加方案使用的规则
            for rule_id, weight in rule_weights.items():
                if rule_id in rules_dict:
                    scheme_rule_hyperedge.add_rule(rules_dict[rule_id], weight)
            
            # 获取所有要素
            elements_by_type = await self.get_all_elements_async()
            all_elements = []
            for element_list in elements_by_type.values():
                all_elements.extend(element_list)
            
            # 对每个规则，计算其影响的要素
            for rule_id, weight in rule_weights.items():
                if rule_id not in rules_dict:
                    continue
                    
                rule_data = rules_dict[rule_id]
                
                # 创建规则函数
                rule_function = None
                if "code" in rule_data and rule_data["code"]:
                    try:
                        rule_function = self.create_rule_function(rule_data["code"])
                    except Exception as e:
                        print(f"编译规则 {rule_id} 代码失败: {e}")
                        continue
                
                # 创建规则对象
                rule = Rule(
                    name=rule_data["name"],
                    rule_function=rule_function,
                    weight=rule_data.get("weight", 1.0),
                    affected_element_keys=rule_data.get("affected_element_keys", []),
                    affected_element_types=rule_data.get("affected_element_types", []),
                    description=rule_data.get("description", ""),
                    code=rule_data.get("code", "")
                )
                
                # 创建规则-要素超边
                hyperedge = RuleElementHyperedge(rule_id, rule_data["name"])
                
                # 对每个要素，检查是否满足规则
                matched_elements = 0
                for element in all_elements:
                    # 应用规则
                    score = rule.apply(element)
                    
                    # 如果得分大于0，则要素满足规则
                    if score > 0:
                        hyperedge.add_element(element, score)
                        matched_elements += 1
                
                print(f"规则 {rule_data['name']} 匹配到 {matched_elements} 个要素")
                
                # 如果超边包含要素，则添加到列表
                if hyperedge.elements:
                    rule_element_hyperedges.append(hyperedge.to_dict())
        
        # 返回方案信息和相关超边
        result = scheme.to_dict()
        if scheme_rule_hyperedge and scheme_rule_hyperedge.rules:
            result["scheme_rule_hyperedge"] = scheme_rule_hyperedge.to_dict()
        if rule_element_hyperedges:
            result["rule_element_hyperedges"] = rule_element_hyperedges
        
        return result

    async def evaluate_scheme_standalone(self, scheme_id: str) -> Dict[str, Any]:
        """评估独立的方案，不关联到特定超图"""
        if not hasattr(self, 'standalone_schemes'):
            self.standalone_schemes = {}
        
        scheme = self.standalone_schemes.get(scheme_id)
        if not scheme:
            return {"error": f"方案 {scheme_id} 不存在"}
        
        # 获取所有要素
        elements_by_type = await self.get_all_elements_async()
        all_elements = []
        for element_list in elements_by_type.values():
            all_elements.extend(element_list)
        
        # 获取所有规则
        rules = await self.get_all_rules_async()
        rules_dict = {rule["id"]: rule for rule in rules}
        
        # 评估结果
        selected_elements = []
        total_score = 0.0
        
        # 获取方案使用的规则及其权重
        rule_weights = scheme.rule_weights
        
        for element in all_elements:
            element_score = 0.0
            element_rule_scores = {}
            
            # 对每个规则进行评估
            for rule_id, weight in rule_weights.items():
                if rule_id not in rules_dict:
                    continue
                    
                rule_data = rules_dict[rule_id]
                
                # 创建规则函数
                rule_function = None
                if "code" in rule_data and rule_data["code"]:
                    try:
                        rule_function = self.create_rule_function(rule_data["code"])
                    except Exception as e:
                        print(f"编译规则 {rule_id} 代码失败: {e}")
                        continue
                
                # 创建规则对象
                rule = Rule(
                    name=rule_data["name"],
                    rule_function=rule_function,
                    weight=rule_data.get("weight", 1.0),
                    affected_element_keys=rule_data.get("affected_element_keys", []),
                    affected_element_types=rule_data.get("affected_element_types", []),
                    description=rule_data.get("description", ""),
                    code=rule_data.get("code", "")
                )
                
                # 应用规则
                rule_score = rule.apply(element)
                if rule_score > 0:
                    # 应用权重
                    weighted_score = rule_score * weight
                    element_score += weighted_score
                    element_rule_scores[rule_id] = weighted_score
            
            if element_score > 0:
                # 创建要素的副本，添加得分信息
                element_copy = element.copy()
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