def apply(self, element, parameter_values=None):
    """应用规则到要素，可以传入参数值"""
    if not self.rule_function:
        return 0.0
        
    # 检查要素类型是否匹配
    if self.affected_element_types and element.get("element_type") not in self.affected_element_types:
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