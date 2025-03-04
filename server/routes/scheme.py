from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from services.hypergraph_service import HypergraphService

# 创建路由器
router = APIRouter()

# 创建服务实例
hypergraph_service = HypergraphService()

# 路由：创建新方案
@router.post("/", response_model=Dict[str, Any], status_code=201)
async def create_scheme(scheme_data: dict = Body(...)):
    """创建新方案，不关联到特定超图"""
    # 验证必要字段
    if "name" not in scheme_data:
        raise HTTPException(status_code=400, detail="方案名称不能为空")
    
    # 创建方案
    scheme = await hypergraph_service.create_scheme_standalone(
        scheme_data["name"],
        scheme_data.get("description", ""),
        scheme_data.get("rule_weights", {})
    )
    
    if not scheme:
        raise HTTPException(status_code=500, detail="创建方案失败")
    
    return scheme

# 路由：获取所有方案
@router.get("/", response_model=List[Dict[str, Any]])
async def get_all_schemes():
    """获取所有方案，不关联到特定超图"""
    if not hasattr(hypergraph_service, 'standalone_schemes'):
        hypergraph_service.standalone_schemes = {}
    
    schemes = [scheme.to_dict() for scheme in hypergraph_service.standalone_schemes.values()]
    return schemes

# 路由：获取特定方案
@router.get("/{scheme_id}", response_model=Dict[str, Any])
async def get_scheme(scheme_id: str):
    """获取特定方案，不关联到特定超图"""
    if not hasattr(hypergraph_service, 'standalone_schemes'):
        hypergraph_service.standalone_schemes = {}
    
    scheme = hypergraph_service.standalone_schemes.get(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail=f"方案 {scheme_id} 不存在")
    
    return scheme.to_dict()

# 路由：评估特定方案
@router.get("/{scheme_id}/evaluate", response_model=Dict[str, Any])
async def evaluate_scheme(scheme_id: str):
    """评估特定方案，不关联到特定超图"""
    result = await hypergraph_service.evaluate_scheme_standalone(scheme_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    return result 