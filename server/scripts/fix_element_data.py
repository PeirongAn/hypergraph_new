import asyncio
import sys
import os

# 添加项目根目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database
from datetime import datetime

async def fix_element_data():
    """修复要素数据中的递归嵌套问题"""
    db = get_database()
    
    # 获取所有要素
    elements = await db.elements.find({}).to_list(length=None)
    
    fixed_count = 0
    for element in elements:
        needs_update = False
        
        # 检查是否存在递归嵌套
        if "attributes" in element and "attributes" in element["attributes"]:
            # 提取最内层的属性
            inner_attrs = element["attributes"]
            while "attributes" in inner_attrs and isinstance(inner_attrs["attributes"], dict):
                inner_attrs = inner_attrs["attributes"]
            
            # 更新为展平的结构
            element["attributes"] = inner_attrs
            needs_update = True
        
        if needs_update:
            # 更新数据库
            element["updated_at"] = datetime.now()
            await db.elements.replace_one({"_id": element["_id"]}, element)
            fixed_count += 1
    
    print(f"已修复 {fixed_count} 个要素数据")

if __name__ == "__main__":
    asyncio.run(fix_element_data()) 