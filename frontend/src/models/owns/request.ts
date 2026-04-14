import WorkOrder from './workOrder';
import { WorkOrderBase } from './workOrderBase';
import File from './file';
import { TrafficLightSafetySeverity } from './trafficLight';

export type RequestSource = 'QR' | 'MANUAL' | 'PORTAL' | 'INTERNAL';

export default interface Request extends WorkOrderBase {
  cancelled: boolean;
  cancellationReason: string | null;
  audioDescription: File;
  workOrder: WorkOrder;
  customId: string;
  contact: string;
  requestSource?: RequestSource | null;
  qrTagId?: number | null;
  poleCode?: string | null;
  faultType?: string | null;
  scanTimestamp?: string | null;
  scanLatitude?: number | null;
  scanLongitude?: number | null;
  safetySeverity?: TrafficLightSafetySeverity | null;
}
