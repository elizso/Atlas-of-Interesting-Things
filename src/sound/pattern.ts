
export type PatternNode =
  | {
      type: 'notes';
      notes: string;
    }
  | {
      type: 'reverse';
      input: PatternNode;
    }
  | {
      type: 'fast';
      factor: number;
      input: PatternNode;
    };

export function generateStrudel(
    node: PatternNode
): string {
    switch (node.type) {
        case 'notes': 
            return `note(${JSON.stringify(node.notes)})`; 
        case 'reverse': 
            return `${generateStrudel(node.input)}.rev()`;
        case 'fast': 
            return `${generateStrudel(node.input)}.fast(${node.factor})`; 
    }
}

