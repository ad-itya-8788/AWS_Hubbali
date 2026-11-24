export type ActivityKind = 'message' | 'broadcast' | 'automation' | 'contact';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
  at: string;
  href?: string;
}
