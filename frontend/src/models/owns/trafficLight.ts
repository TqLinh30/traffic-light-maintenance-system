import { AssetMiniDTO } from './asset';
import { Audit } from './audit';
import Schedule from './schedule';

export type TrafficLightStatus =
  | 'HEALTHY'
  | 'MAINTENANCE_DUE_SOON'
  | 'MAINTENANCE_OVERDUE'
  | 'NEEDS_REPAIR'
  | 'IN_PROGRESS'
  | 'INACTIVE';

export type TrafficLightSafetySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TrafficLightWorkOrderMini {
  id: number;
  title: string;
  dueDate?: string | null;
  customId?: string | null;
  status: string;
  createdAt: string;
}

export interface TrafficLightPointPublicDTO extends Audit {
  atlasLocationId: number;
  poleCode: string;
  name: string;
  address: string;
  locationImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
  ward?: string | null;
  roadName?: string | null;
  intersectionName?: string | null;
  mainAsset?: AssetMiniDTO | null;
  trafficLightType?: string | null;
  controllerType?: string | null;
  installationDate?: string | null;
  expectedWarrantyDate?: string | null;
  maintenanceHistory?: string | null;
  maintenanceCycleDays?: number | null;
  lastInspectionAt?: string | null;
  lastMaintenanceAt?: string | null;
  nextMaintenanceAt?: string | null;
  currentStatus: TrafficLightStatus;
  isActive: boolean;
}

export interface TrafficLightQrResolveDTO {
  qrPublicCode: string;
  point: TrafficLightPointPublicDTO;
  activeWorkOrders: TrafficLightWorkOrderMini[];
}

export interface TrafficLightMapPointDTO {
  id: number;
  atlasLocationId: number;
  poleCode: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  district?: string | null;
  ward?: string | null;
  currentStatus: TrafficLightStatus;
  lastMaintenanceAt?: string | null;
  nextMaintenanceAt?: string | null;
}

export interface TrafficLightPreventiveMaintenanceSummaryDTO {
  id: number;
  name: string;
  customId?: string | null;
  nextWorkOrderDate?: string | null;
  schedule?: Schedule | null;
}

export interface TrafficLightPointDetailDTO {
  point: TrafficLightPointPublicDTO;
  activeQrPublicCode?: string | null;
  activeQrPublicUrl?: string | null;
  preventiveMaintenances: TrafficLightPreventiveMaintenanceSummaryDTO[];
  recentWorkOrders: TrafficLightWorkOrderMini[];
}

export interface TrafficLightQrRequestCreateDTO {
  title: string;
  description?: string | null;
  contact?: string | null;
  faultType?: string | null;
  scanTimestamp?: string;
  scanLatitude?: number | null;
  scanLongitude?: number | null;
  safetySeverity?: TrafficLightSafetySeverity | null;
}

export interface TrafficLightQrSuccessState {
  requestId?: number;
  requestTitle?: string;
  submittedAt?: string;
}
