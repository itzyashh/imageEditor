import type { IconName } from '@/components/general/Icon';

export type EditorToolId = 'crop' | 'adjust' | 'filters' | 'text' | 'draw' | 'enhance';

export type EditorTool = {
  id: EditorToolId;
  label: string;
  icon: IconName;
  accent: string;
};

export const EDITOR_TOOLS: EditorTool[] = [
  { id: 'crop', label: 'Crop', icon: { ios: 'crop', android: 'crop' }, accent: '#4F8CFF' },
  { id: 'adjust', label: 'Adjust', icon: { ios: 'slider.horizontal.3', android: 'tune' }, accent: '#22C55E' },
  { id: 'filters', label: 'Filters', icon: { ios: 'camera.filters', android: 'filter_vintage' }, accent: '#F59E0B' },
  { id: 'text', label: 'Text', icon: { ios: 'textformat', android: 'text_fields' }, accent: '#EC4899' },
  { id: 'draw', label: 'Draw', icon: { ios: 'pencil.tip', android: 'draw' }, accent: '#8B5CF6' },
  { id: 'enhance', label: 'Enhance', icon: { ios: 'wand.and.stars', android: 'auto_fix_high' }, accent: '#06B6D4' },
];
