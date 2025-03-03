from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
import logging
from typing import Optional
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 数据库连接信息
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hypergraph_db")

# 全局数据库客户端
client: Optional[AsyncIOMotorClient] = None
db = None

async def connect_to_mongodb():
    """连接到MongoDB数据库"""
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        # 验证连接
        await client.admin.command('ping')
        db = client[DATABASE_NAME]
        logger.info("成功连接到MongoDB")
        
        # 创建索引
        await db.elements.create_index("id", unique=True)
        await db.elements.create_index("type")
        await db.rules.create_index("id", unique=True)
        await db.rules.create_index("name")
        
        logger.info("已创建数据库索引")
    except ConnectionFailure as e:
        logger.error(f"无法连接到MongoDB: {e}")
        raise

async def close_mongodb_connection():
    """关闭MongoDB连接"""
    global client
    if client:
        client.close()
        logger.info("MongoDB连接已关闭")

def get_database():
    """获取数据库实例"""
    if db is None:
        raise ConnectionError("数据库未连接")
    return db 