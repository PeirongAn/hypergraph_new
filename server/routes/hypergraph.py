from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from services.hypergraph_service import HypergraphService
from pydantic import BaseModel

# 创建路由器
router = APIRouter()

# 创建服务实例
hypergraph_service = HypergraphService()

# 创建演示超图
demo_hypergraph = hypergraph_service.create_demo_hypergraph()

# 请求模型
class HypergraphCreate(BaseModel):
    name: str
    description: str = ""

class ElementCreate(BaseModel):
    id: str
    type: str
    attributes: Dict[str, Any]

class ElementUpdate(BaseModel):
    attributes: Dict[str, Any]

class RuleCreate(BaseModel):
    name: str
    weight: float = 1.0
    affected_element_keys: List[str] = []
    affected_element_types: List[str] = []
    description: str = ""
    code: str = ""

class RuleUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[float] = None
    affected_element_keys: Optional[List[str]] = None
    affected_element_types: Optional[List[str]] = None
    description: Optional[str] = None
    code: Optional[str] = None

# 共享要素和规则的路由
# 这些路由应该在超图特定路由之前定义

# 路由：获取所有共享要素
@router.get("/elements", response_model=Dict[str, List[Dict[str, Any]]])
async def get_all_shared_elements():
    return await hypergraph_service.get_all_elements_async()

# 路由：获取特定类型的共享要素
@router.get("/elements/{element_type}", response_model=List[Dict[str, Any]])
async def get_shared_elements_by_type(element_type: str):
    return await hypergraph_service.get_elements_by_type_async(element_type)

# 路由：创建新共享要素
@router.post("/elements", response_model=Dict[str, Any], status_code=201)
async def create_shared_element(element_data: ElementCreate):
    return await hypergraph_service.create_element_async(element_data.id, element_data.type, element_data.attributes)

# 路由：更新共享要素
@router.put("/elements/{element_id}", response_model=Dict[str, Any])
async def update_shared_element(element_id: str, element_data: ElementUpdate):
    result = await hypergraph_service.update_element_async(element_id, element_data.attributes)
    if not result:
        raise HTTPException(status_code=404, detail=f"要素 {element_id} 不存在")
    return result

# 路由：删除共享要素
@router.delete("/elements/{element_id}", response_model=Dict[str, str])
async def delete_shared_element(element_id: str):
    success = await hypergraph_service.delete_element_async(element_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"要素 {element_id} 不存在")
    return {"message": f"要素 {element_id} 已删除"}

# 路由：获取所有共享规则
@router.get("/rules", response_model=List[Dict[str, Any]])
async def get_all_shared_rules():
    return await hypergraph_service.get_all_rules_async()

# 路由：创建新共享规则
@router.post("/rules", response_model=Dict[str, Any], status_code=201)
async def create_shared_rule(rule_data: RuleCreate):
    return await hypergraph_service.create_rule_async(
        rule_data.name, 
        rule_data.weight, 
        rule_data.affected_element_types,
        rule_data.affected_element_keys,
        rule_data.description,
        rule_data.code
    )

# 路由：更新共享规则
@router.put("/rules/{rule_id}", response_model=Dict[str, Any])
async def update_shared_rule(rule_id: str, rule_data: RuleUpdate):
    # 记录请求信息，帮助调试
    print(f"更新规则请求: ID={rule_id}, 数据={rule_data}")
    
    result = await hypergraph_service.update_rule_async(rule_id, rule_data)
    if not result:
        raise HTTPException(status_code=404, detail=f"规则 {rule_id} 不存在")
    return result

# 路由：删除共享规则
@router.delete("/rules/{rule_id}", response_model=Dict[str, str])
async def delete_shared_rule(rule_id: str):
    # 记录请求信息，帮助调试
    print(f"删除规则请求: ID={rule_id}")
    
    success = await hypergraph_service.delete_rule_async(rule_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"规则 {rule_id} 不存在")
    return {"message": f"规则 {rule_id} 已删除"}

# 路由：获取规则到要素的超边
# 注意：这个路由应该放在超图特定路由之前，与其他共享资源路由一起
@router.get("/rule-element-hyperedges", response_model=List[Dict[str, Any]])
async def get_rule_element_hyperedges():
    """获取规则到要素的超边，表示每个规则影响的所有要素"""
    return await hypergraph_service.calculate_rule_element_hyperedges()

# 超图特定的路由
# 这些路由应该在共享要素和规则路由之后定义

# 路由：获取所有超图
@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_hypergraphs():
    hypergraphs = hypergraph_service.get_all_hypergraphs()
    return hypergraphs

# 路由：创建新超图
@router.post("/", response_model=Dict[str, Any], status_code=201)
async def create_hypergraph(hypergraph_data: HypergraphCreate):
    if not hypergraph_data.name:
        raise HTTPException(status_code=400, detail="超图名称不能为空")
    
    hypergraph = hypergraph_service.create_hypergraph(hypergraph_data.name, hypergraph_data.description)
    return hypergraph.to_dict()

# 路由：获取特定超图
@router.get("/{hypergraph_id}", response_model=Dict[str, Any])
async def get_hypergraph(hypergraph_id: str):
    hypergraph = hypergraph_service.get_hypergraph(hypergraph_id)
    if not hypergraph:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    return hypergraph.to_dict()

# 路由：删除特定超图
@router.delete("/{hypergraph_id}", response_model=Dict[str, str])
async def delete_hypergraph(hypergraph_id: str):
    success = hypergraph_service.delete_hypergraph(hypergraph_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    return {"message": f"超图 {hypergraph_id} 已删除"}

# 路由：获取超图的所有要素
@router.get("/{hypergraph_id}/elements", response_model=Dict[str, List[Dict[str, Any]]])
async def get_all_elements(hypergraph_id: str):
    hypergraph = hypergraph_service.get_hypergraph(hypergraph_id)
    if not hypergraph:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    # 使用共享要素
    return hypergraph_service.get_all_elements()

# 路由：获取超图的特定类型要素
@router.get("/{hypergraph_id}/elements/{element_type}", response_model=List[Dict[str, Any]])
async def get_elements_by_type(hypergraph_id: str, element_type: str):
    hypergraph = hypergraph_service.get_hypergraph(hypergraph_id)
    if not hypergraph:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    # 使用共享要素
    return hypergraph_service.get_elements_by_type(element_type)

# 路由：获取超图的所有规则
@router.get("/{hypergraph_id}/rules", response_model=List[Dict[str, Any]])
async def get_all_rules(hypergraph_id: str):
    hypergraph = hypergraph_service.get_hypergraph(hypergraph_id)
    if not hypergraph:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    # 使用共享规则
    return hypergraph_service.get_all_rules()

# 路由：获取超图的所有方案
@router.get("/{hypergraph_id}/schemes", response_model=List[Dict[str, Any]])
async def get_all_schemes(hypergraph_id: str):
    hypergraph = hypergraph_service.get_hypergraph(hypergraph_id)
    if not hypergraph:
        raise HTTPException(status_code=404, detail=f"超图 {hypergraph_id} 不存在")
    
    return hypergraph.get_all_schemes()

# 路由：评估超图的特定方案
@router.get("/{hypergraph_id}/schemes/{scheme_id}/evaluate", response_model=Dict[str, Any])
async def evaluate_scheme(hypergraph_id: str, scheme_id: str):
    result = hypergraph_service.evaluate_scheme(hypergraph_id, scheme_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result

# 路由：评估超图的所有方案
@router.get("/{hypergraph_id}/schemes/evaluate-all", response_model=Dict[str, Dict[str, Any]])
async def evaluate_all_schemes(hypergraph_id: str):
    results = hypergraph_service.evaluate_all_schemes(hypergraph_id)
    if isinstance(results, dict) and "error" in results:
        raise HTTPException(status_code=404, detail=results["error"])
    
    return results 