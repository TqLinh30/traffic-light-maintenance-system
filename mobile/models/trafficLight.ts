import { Audit } from './audit';
import { AssetMiniDTO } from './asset';

export type TrafficLightStatus =
  | 'HEALTHY'
  | 'MAINTENANCE_DUE_SOON'
  | 'MAINTENANCE_OVERDUE'
  | 'NEEDS_REPAIR'
  | 'IN_PROGRESS'
  | 'INACTIVE';

export interface TrafficLightPointPublicDTO extends Audit {
  atlasLocationId: number;
  poleCode: string;
  name: string;
  address: string;
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
  maintenanceCycleDays?: number | null;
  lastInspectionAt?: string | null;
  lastMaintenanceAt?: string | null;
  nextMaintenanceAt?: string | null;
  currentStatus: TrafficLightStatus;
  isActive: boolean;
}

export interface TrafficLightPointDetailDTO {
  point: TrafficLightPointPublicDTO;
  activeQrPublicCode?: string | null;
  activeQrPublicUrl?: string | null;
}
