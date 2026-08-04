export type ResearchNodeStatus = 'live' | 'building' | 'review' | 'planned';

export type ResearchArtifactKind = 'product' | 'design' | 'frontend' | 'backend' | 'qa';

export interface ResearchArtifact {
  id: string;
  kind: ResearchArtifactKind;
  title: string;
  detail: string;
  path?: string;
  status: 'ready' | 'working' | 'missing';
}

export interface ResearchDecision {
  date: string;
  title: string;
  description: string;
}

export interface ResearchNode {
  id: string;
  sequence: string;
  title: string;
  eyebrow: string;
  description: string;
  route: string;
  icon: string;
  status: ResearchNodeStatus;
  progress: number;
  owner: string;
  updatedAt: string;
  tags: string[];
  position: { x: number; y: number };
  artifacts: ResearchArtifact[];
  decisions: ResearchDecision[];
}

export interface ResearchConnection {
  from: string;
  to: string;
  variant?: 'main' | 'support';
}
