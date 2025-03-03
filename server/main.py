from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.hypergraph import router as hypergraph_router
import uvicorn
import logging
from database import connect_to_mongodb, close_mongodb_connection
from services.hypergraph_service import HypergraphService
from services.db_service import DatabaseService

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(title="超图分析系统 API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载路由
app.include_router(hypergraph_router, prefix="/api/hypergraph", tags=["hypergraph"])

# 根路由
@app.get("/")
async def root():
    return {"message": "欢迎使用超图分析系统 API"}

# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("服务器启动")
    
    # 连接数据库
    await connect_to_mongodb()
    
    # 打印所有路由
    routes = [{"path": route.path, "name": route.name} for route in app.routes]
    logger.info(f"注册的路由: {routes}")
    
    # 迁移现有数据到数据库
    hypergraph_service = HypergraphService()
    elements = hypergraph_service.get_all_elements()
    rules = hypergraph_service.get_all_rules()
    
    await DatabaseService.migrate_elements(elements)
    await DatabaseService.migrate_rules(rules)

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("服务器关闭")
    await close_mongodb_connection()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True) 