import metricsData from './data/metrics.json';
import journeysData from './data/journeys.json';
import guidanceData from './data/scene-guidance.json';
import { deepFreeze } from './freeze';
import type { Journey, Metric, WorldId } from './types';

export const metrics: readonly Metric[] = deepFreeze(metricsData as Metric[]);
export const journeys: readonly Journey[] = deepFreeze(journeysData as Journey[]);
export const sceneGuidance: Readonly<Record<WorldId, Record<string, string>>> = deepFreeze(guidanceData as Record<WorldId, Record<string, string>>);
