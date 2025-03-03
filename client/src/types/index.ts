export interface Hypergraph {
  id: string;
  name: string;
  description: string;
  elements_count: number;
  rules_count: number;
  schemes_count: number;
  element_types: string[];
  created_at: string;
  updated_at: string;
}

export interface Element {
  id: string;
  type: string;
  attributes: Record<string, any>;
  score?: number;
  rule_scores?: Record<string, number>;
}

export interface Rule {
  id: string;
  name: string;
  weight: number;
  affected_element_types: string[];
  condition?: string;
  scoring?: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
  score: number;
  selected_elements_count: number;
}

export interface SchemeEvaluationResult {
  scheme_id: string;
  scheme_name: string;
  scheme_description: string;
  scheme_score: number;
  selected_elements: Element[];
} 