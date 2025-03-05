from typing import Dict, List, Any, Optional
from datetime import datetime
from database import get_database
import logging
import uuid

# 配置日志
logger = logging.getLogger(__name__)

class DatabaseService:
    """数据库服务，处理与MongoDB的交互"""
    
    @staticmethod
    async def get_all_elements() -> Dict[str, List[Dict[str, Any]]]:
        """获取所有要素，按类型分组"""
        db = get_database()
        cursor = db.elements.find({})
        elements = await cursor.to_list(length=None)
        
        # 按类型分组
        result = {}
        for element in elements:
            element_type = element["type"]
            if element_type not in result:
                result[element_type] = []
            
            # 移除MongoDB的_id字段
            element.pop("_id", None)
            result[element_type].append(element)
        
        return result
    
    @staticmethod
    async def get_elements_by_type(element_type: str) -> List[Dict[str, Any]]:
        """获取特定类型的所有要素"""
        db = get_database()
        cursor = db.elements.find({"type": element_type})
        elements = await cursor.to_list(length=None)
        
        # 移除MongoDB的_id字段
        for element in elements:
            element.pop("_id", None)
        
        return elements
    
    @staticmethod
    async def get_element_by_id(element_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取要素"""
        db = get_database()
        element = await db.elements.find_one({"id": element_id})
        
        if element:
            element.pop("_id", None)
        
        return element
    
    @staticmethod
    async def create_element(element_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新要素"""
        db = get_database()
        
        # 准备要素数据，避免递归嵌套
        element = {
            "id": element_data["id"],
            "type": element_data["type"],
            "attributes": element_data.get("attributes", {}),
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # 确保 attributes 不包含递归嵌套
        if "attributes" in element_data and "attributes" in element_data["attributes"]:
            # 如果发现嵌套，则展平结构
            nested_attrs = element_data["attributes"]["attributes"]
            if isinstance(nested_attrs, dict):
                element["attributes"] = nested_attrs
        
        # 插入数据库
        await db.elements.insert_one(element)
        
        # 移除MongoDB的_id字段
        element.pop("_id", None)
        
        return element
    
    @staticmethod
    async def update_element(element_id: str, attributes: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新要素"""
        db = get_database()
        
        # 检查是否存在
        existing = await db.elements.find_one({"id": element_id})
        if not existing:
            return None
        
        # 更新属性和时间戳
        update_data = {
            "$set": {
                "attributes": {**existing["attributes"], **attributes},
                "updated_at": datetime.now()
            }
        }
        
        await db.elements.update_one({"id": element_id}, update_data)
        
        # 获取更新后的要素
        updated = await db.elements.find_one({"id": element_id})
        updated.pop("_id", None)
        
        return updated
    
    @staticmethod
    async def delete_element(element_id: str) -> bool:
        """删除要素"""
        db = get_database()
        
        result = await db.elements.delete_one({"id": element_id})
        return result.deleted_count > 0
    
    @staticmethod
    async def get_all_rules() -> List[Dict[str, Any]]:
        """获取所有规则"""
        db = get_database()
        cursor = db.rules.find({})
        rules = await cursor.to_list(length=None)
        
        # 移除MongoDB的_id字段
        for rule in rules:
            rule.pop("_id", None)
        
        return rules
    
    @staticmethod
    async def get_rule_by_id(rule_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取规则"""
        db = get_database()
        
        # 尝试直接查找
        rule = await db.rules.find_one({"id": rule_id})
        
        if not rule:
            # 尝试查找名称匹配的规则
            rule = await db.rules.find_one({"name": rule_id})
            
            if not rule:
                # 尝试将规则名称转换为ID格式
                converted_id = rule_id.lower().replace(" ", "_")
                rule = await db.rules.find_one({"id": converted_id})
        
        if rule:
            rule.pop("_id", None)
        
        return rule
    
    @staticmethod
    async def create_rule(rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新规则"""
        rule_id = rule_data.get("id", rule_data["name"].lower().replace(" ", "_"))
        
        # 确保规则ID唯一
        if rule_id in DatabaseService.rules:
            # 如果ID已存在，生成一个新的唯一ID
            rule_id = f"{rule_id}_{uuid.uuid4().hex[:8]}"
        
        # 创建规则记录
        rule = {
            "id": rule_id,
            "name": rule_data["name"],
            "weight": rule_data.get("weight", 1.0),
            "affected_element_types": rule_data.get("affected_element_types", []),
            "affected_element_keys": rule_data.get("affected_element_keys", []),
            "description": rule_data.get("description", ""),
            "code": rule_data.get("code", ""),
            "parameters": rule_data.get("parameters", {})  # 添加参数字段
        }
        
        # 存储规则
        DatabaseService.rules[rule_id] = rule
        
        return rule
    
    @staticmethod
    async def update_rule(rule_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新规则"""
        rule = await DatabaseService.get_rule_by_id(rule_id=rule_id)
        if not rule:
            return None
        db = get_database()
        # 更新规则字段
        for key, value in update_data.items():
            rule[key] = value
        # 存入db        
        await db.rules.update_one({"id": rule_id}, {"$set": rule})
        return rule
    
    @staticmethod
    async def delete_rule(rule_id: str) -> bool:
        """删除规则"""
        db = get_database()
        
        # 获取规则
        rule = await DatabaseService.get_rule_by_id(rule_id)
        if not rule:
            return False
        
        # 删除规则
        result = await db.rules.delete_one({"id": rule["id"]})
        return result.deleted_count > 0
    
    @staticmethod
    async def migrate_elements(elements: Dict[str, List[Dict[str, Any]]]) -> None:
        """迁移要素数据到数据库"""
        db = get_database()
        
        # 检查集合是否为空
        count = await db.elements.count_documents({})
        if count > 0:
            logger.info("要素集合不为空，跳过迁移")
            return
        
        # 准备批量插入的数据
        elements_to_insert = []
        
        for element_type, element_list in elements.items():
            for element in element_list:
                # 确保要素数据结构正确
                element_data = {
                    "id": element["id"],
                    "type": element_type,
                    "attributes": {k: v for k, v in element.items() if k != "type"},  # 排除 type 字段
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                elements_to_insert.append(element_data)
        
        if elements_to_insert:
            await db.elements.insert_many(elements_to_insert)
            logger.info(f"已迁移 {len(elements_to_insert)} 个要素到数据库")
    
    @staticmethod
    async def migrate_rules(rules: List[Dict[str, Any]]) -> None:
        """迁移规则数据到数据库"""
        db = get_database()
        
        # 检查集合是否为空
        count = await db.rules.count_documents({})
        if count > 0:
            logger.info("规则集合不为空，跳过迁移")
            return
        
        # 准备批量插入的数据
        rules_to_insert = []
        
        for rule in rules:
            rule_data = {
                "id": rule["id"],
                "name": rule["name"],
                "weight": rule["weight"],
                "affected_element_keys": rule.get("affected_element_keys", []),
                "affected_element_types": rule["affected_element_types"],
                "description": rule.get("description", ""),
                "parameters": rule.get("parameters", {}),
                "code": rule.get("code", ""),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            rules_to_insert.append(rule_data)
        
        if rules_to_insert:
            await db.rules.insert_many(rules_to_insert)
            logger.info(f"已迁移 {len(rules_to_insert)} 个规则到数据库")
    
    @staticmethod
    async def get_all_schemes() -> List[Dict[str, Any]]:
        """获取所有方案"""
        db = get_database()
        cursor = db.schemes.find({})
        schemes = await cursor.to_list(length=None)
        
        # 移除MongoDB的_id字段
        for scheme in schemes:
            scheme.pop("_id", None)
        
        return schemes
    
    @staticmethod
    async def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取方案"""
        db = get_database()
        scheme = await db.schemes.find_one({"id": scheme_id})
        
        if scheme:
            scheme.pop("_id", None)
        
        return scheme
    
    @staticmethod
    async def create_scheme(scheme_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新方案"""
        db = get_database()
        
        # 准备方案数据
        scheme = {
            "id": scheme_data["id"],
            "name": scheme_data["name"],
            "description": scheme_data.get("description", ""),
            "rule_weights": scheme_data.get("rule_weights", {}),  # 存储完整的规则配置
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # 插入数据库
        await db.schemes.insert_one(scheme)
        
        # 移除MongoDB的_id字段
        scheme.pop("_id", None)
        
        return scheme
    
    @staticmethod
    async def update_scheme(scheme_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新方案"""
        db = get_database()
        
        # 获取方案
        scheme = await DatabaseService.get_scheme_by_id(scheme_id)
        if not scheme:
            return None
        
        # 准备更新数据
        update_fields = {}
        if "name" in update_data:
            update_fields["name"] = update_data["name"]
        if "description" in update_data:
            update_fields["description"] = update_data["description"]
        if "rule_weights" in update_data:
            update_fields["rule_weights"] = update_data["rule_weights"]
        
        # 添加更新时间
        update_fields["updated_at"] = datetime.now()
        
        # 更新数据库
        await db.schemes.update_one(
            {"id": scheme_id},
            {"$set": update_fields}
        )
        
        # 获取更新后的方案
        return await DatabaseService.get_scheme_by_id(scheme_id)
    
    @staticmethod
    async def delete_scheme(scheme_id: str) -> bool:
        """删除方案"""
        db = get_database()
        
        # 获取方案
        scheme = await DatabaseService.get_scheme_by_id(scheme_id)
        if not scheme:
            return False
        
        # 删除方案
        result = await db.schemes.delete_one({"id": scheme_id})
        return result.deleted_count > 0 