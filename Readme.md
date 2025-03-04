假设你是一个经验丰富的软件开发工程师，当前我想做一个分层超图构建工具，帮我从0开始设计这个工具，并给出详细的设计文档和代码实现。
1. 首先是server,使用paython, 需要支持http请求、websocket通信，并支持restful api
2. 然后是client, 需要支持web页面，并支持websocket通信，使用react, 支持tailwindcss, 支持antd
下面关注server的实现：
1. 超图分为3层：底层要素层、规则层、上层方案层
2. 要素层用字典表示不同类别的要素（景点、美食等），每个要素包含属性和初始得分：
```python
elements = {
    "景点": [
        {"id": "A1", "name": "故宫", "季节": ["春", "秋"], "价格": 60, "评分": 4.8},
        {"id": "A2", "name": "长城", "季节": ["春", "秋", "冬"], "价格": 40, "评分": 4.5},
    ],
    "美食": [
        {"id": "F1", "name": "烤鸭店", "人均消费": 120, "评分": 4.7, "标签": ["本地特色"]},
        {"id": "F2", "name": "火锅店", "人均消费": 80, "评分": 4.3, "标签": ["辣"]},
    ],
    "住宿": [
        {"id": "H1", "name": "经济酒店", "价格": 300, "距离地铁": 500, "评分": 4.0},
        {"id": "H2", "name": "豪华酒店", "价格": 1000, "距离地铁": 2000, "评分": 4.8},
    ]
}
```
3. 规则层使用超边，用类Rule表示规则，每个规则包含 条件函数、权重、评分函数 和 关联的要素类型：
```python
class Rule:
    def __init__(self, name, condition, weight, scoring=None, affected_element_types=None):
        self.name = name                # 规则名称
        self.condition = condition      # 条件函数（返回布尔值）
        self.weight = weight            # 权重（0~1）
        self.scoring = scoring          # 评分函数（返回0~1的数值，可选）
        self.affected_element_types = affected_element_types  # 影响的要素类型（如["景点", "住宿"]）

    def apply(self, element):
        """检查要素是否满足条件，并返回得分"""
        if self.condition(element):
            if self.scoring:
                return self.scoring(element) * self.weight
            else:
                return 1.0 * self.weight  # 无评分函数时默认得分=权重
        else:
            return 0.0
```
3.1 规则层定义示例
3.1.1 硬性规则：季节匹配（过滤非秋季景点）
```python
# 定义规则
# 用户选择的季节为"秋"
rule_season = Rule(
    name="季节匹配",
    condition=lambda elem: "秋" in elem.get("季节", []),
    weight=1.0,
    affected_element_types=["景点"]
)
```
3.1.2 软性规则：评分高于4.5的景点
```python
# 定义规则
rule_budget = Rule(
    name="经济型住宿",
    condition=lambda elem: elem["价格"] <= 500,
    weight=0.8,
    scoring=lambda elem: 1 - (elem["价格"] / 500),  # 价格≤500时，价格越低得分越高
    affected_element_types=["住宿"]
)
rule_food = Rule(
    name="美食优先",
    condition=lambda elem: elem["评分"] >= 4.5 and "本地特色" in elem.get("标签", []),
    weight=0.9,
    scoring=lambda elem: elem["评分"] * 0.2 + (1 if "本地特色" in elem["标签"] else 0) * 0.8,
    affected_element_types=["美食"]
)
```
4. 方案层用字典表示不同类别的方案（如"经济游览"、"美食游览"、"文化游览"），每个方案包含 方案名称、方案描述、方案得分 和 关联的规则
```python
# 定义方案
# 经济游览方案：选择经济型住宿和评分高的景点
economic_tour = Scheme(
    name="经济游览",
    description="选择经济型住宿和评分高的景点",
    rules=[rule_budget, rule_season],
    scoring=lambda elements: sum(elem.get("评分", 0) for elem in elements) / len(elements)
)
```
帮助我生成代码，补齐实现逻辑

