export type NodeKind =
  | 'notes'
  | 'reverse'
  | 'fast'
  | 'output';

export type PatchNode = {
  id: string;
  kind: NodeKind;
};

export type Connection = {
  from: string;
  to: string;
};

export const nodes: PatchNode[] = [
  { id: 'notes-1', kind: 'notes' },
  { id: 'reverse-1', kind: 'reverse' },
  { id: 'fast-1', kind: 'fast' },
  { id: 'output-1', kind: 'output' }
];

export const connections: Connection[] = [
  { from: 'notes-1', to: 'reverse-1' },
  { from: 'reverse-1', to: 'fast-1' },
  { from: 'fast-1', to: 'output-1' }
];

export function toggleConnection(
  from: string,
  to: string
): void {
  const index = connections.findIndex(
    connection =>
      connection.from === from &&
      connection.to === to
  );

  if (index !== -1) {
    connections.splice(index, 1);
  } else {
    connections.push({ from, to });
  }
}
