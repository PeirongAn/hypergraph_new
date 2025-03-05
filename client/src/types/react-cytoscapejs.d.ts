declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import cytoscape from 'cytoscape';

  export interface CytoscapeComponentProps {
    elements: cytoscape.ElementDefinition[];
    stylesheet?: cytoscape.Stylesheet[];
    layout?: cytoscape.LayoutOptions;
    cy?: (cy: cytoscape.Core) => void;
    style?: React.CSSProperties;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
} 