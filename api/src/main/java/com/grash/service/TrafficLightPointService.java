package com.grash.service;

import com.grash.dto.AssetMiniDTO;
import com.grash.dto.trafficLight.TrafficLightMapPointDTO;
import com.grash.dto.trafficLight.TrafficLightPointDetailDTO;
import com.grash.dto.trafficLight.TrafficLightPointPublicDTO;
import com.grash.dto.trafficLight.TrafficLightPreventiveMaintenanceSummaryDTO;
import com.grash.dto.trafficLight.TrafficLightQrRequestCreateDTO;
import com.grash.dto.trafficLight.TrafficLightQrResolveDTO;
import com.grash.dto.PreventiveMaintenanceShowDTO;
import com.grash.dto.workOrder.WorkOrderMiniDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.PreventiveMaintenanceMapper;
import com.grash.mapper.WorkOrderMapper;
import com.grash.model.Asset;
import com.grash.model.Location;
import com.grash.model.PreventiveMaintenance;
import com.grash.model.QrTag;
import com.grash.model.Request;
import com.grash.model.TrafficLightPoint;
import com.grash.model.WorkOrder;
import com.grash.model.enums.Priority;
import com.grash.model.enums.QrTagStatus;
import com.grash.model.enums.RequestSource;
import com.grash.model.enums.Status;
import com.grash.model.enums.TrafficLightStatus;
import com.grash.repository.PreventiveMaintenanceRepository;
import com.grash.repository.QrTagRepository;
import com.grash.repository.RequestRepository;
import com.grash.repository.TrafficLightPointRepository;
import com.grash.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrafficLightPointService {

    private final TrafficLightPointRepository trafficLightPointRepository;
    private final QrTagRepository qrTagRepository;
    private final RequestRepository requestRepository;
    private final PreventiveMaintenanceRepository preventiveMaintenanceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final RequestService requestService;
    private final WorkOrderService workOrderService;
    private final PreventiveMaintenanceMapper preventiveMaintenanceMapper;
    private final WorkOrderMapper workOrderMapper;

    public List<TrafficLightMapPointDTO> getMapPoints(Long companyId) {
        List<TrafficLightPoint> points = trafficLightPointRepository.findByCompanyIdWithLocation(companyId);
        if (points.isEmpty()) {
            return List.of();
        }

        List<Long> locationIds = points.stream()
                .map(point -> point.getLocation().getId())
                .toList();
        List<Long> assetIds = points.stream()
                .map(TrafficLightPoint::getMainAsset)
                .filter(asset -> asset != null)
                .map(Asset::getId)
                .distinct()
                .toList();

        List<WorkOrder> relatedWorkOrders = assetIds.isEmpty()
                ? workOrderRepository.findByLocationIdsWithDetails(locationIds)
                : workOrderRepository.findByLocationIdsOrAssetIdsWithDetails(locationIds, assetIds);
        Map<Long, List<WorkOrder>> workOrdersByLocationId = relatedWorkOrders.stream()
                .filter(workOrder -> workOrder.getLocation() != null)
                .collect(Collectors.groupingBy(workOrder -> workOrder.getLocation().getId()));
        Map<Long, List<WorkOrder>> workOrdersByAssetId = relatedWorkOrders.stream()
                .filter(workOrder -> workOrder.getAsset() != null)
                .collect(Collectors.groupingBy(workOrder -> workOrder.getAsset().getId()));

        List<PreventiveMaintenance> relatedPreventiveMaintenances = assetIds.isEmpty()
                ? preventiveMaintenanceRepository.findByLocationIdsWithSchedule(locationIds)
                : preventiveMaintenanceRepository.findByLocationIdsOrAssetIdsWithSchedule(locationIds, assetIds);
        Map<Long, List<PreventiveMaintenance>> preventiveMaintenancesByLocationId = relatedPreventiveMaintenances
                .stream()
                .filter(preventiveMaintenance -> preventiveMaintenance.getLocation() != null)
                .collect(Collectors.groupingBy(preventiveMaintenance -> preventiveMaintenance.getLocation().getId()));
        Map<Long, List<PreventiveMaintenance>> preventiveMaintenancesByAssetId = relatedPreventiveMaintenances.stream()
                .filter(preventiveMaintenance -> preventiveMaintenance.getAsset() != null)
                .collect(Collectors.groupingBy(preventiveMaintenance -> preventiveMaintenance.getAsset().getId()));

        Set<Long> openRequestLocationIds = new LinkedHashSet<>(requestRepository.findOpenLocationIds(locationIds));

        return points.stream()
                .map(point -> toMapDto(point,
                        mergeRelatedWorkOrders(point, workOrdersByLocationId, workOrdersByAssetId),
                        mergeRelatedPreventiveMaintenances(point, preventiveMaintenancesByLocationId,
                                preventiveMaintenancesByAssetId),
                        openRequestLocationIds.contains(point.getLocation().getId())))
                .filter(point -> point.getLatitude() != null && point.getLongitude() != null)
                .toList();
    }

    public TrafficLightQrResolveDTO resolveByQrPublicCode(String qrPublicCode) {
        QrTag qrTag = resolveActiveQrTag(qrPublicCode);
        TrafficLightQrResolveDTO response = new TrafficLightQrResolveDTO();
        response.setQrPublicCode(qrPublicCode);
        response.setPoint(toPublicDto(qrTag.getTrafficLightPoint()));
        response.setActiveWorkOrders(getActiveWorkOrders(qrTag.getTrafficLightPoint()));
        return response;
    }

    public TrafficLightPointDetailDTO getDetailsByLocationId(Long locationId, Long companyId) {
        TrafficLightPoint point = trafficLightPointRepository.findByLocationIdAndCompanyIdWithRelations(locationId,
                        companyId)
                .orElseThrow(() -> new CustomException("Traffic light point not found", HttpStatus.NOT_FOUND));
        QrTag activeQrTag = ensureActiveQrTag(point);

        TrafficLightPointDetailDTO dto = new TrafficLightPointDetailDTO();
        dto.setPoint(toPublicDto(point));
        dto.setActiveQrPublicCode(activeQrTag.getQrPublicCode());
        dto.setPreventiveMaintenances(getRelatedPreventiveMaintenances(point).stream()
                .map(this::toPreventiveMaintenanceSummaryDto)
                .sorted(Comparator.comparing(TrafficLightPreventiveMaintenanceSummaryDTO::getNextWorkOrderDate,
                        Comparator.nullsLast(Date::compareTo)))
                .toList());
        dto.setRecentWorkOrders(getRecentWorkOrders(point));
        return dto;
    }

    public Request createRequestFromQr(String qrPublicCode, TrafficLightQrRequestCreateDTO dto) {
        QrTag qrTag = resolveActiveQrTag(qrPublicCode);
        TrafficLightPoint point = qrTag.getTrafficLightPoint();

        Request request = new Request();
        request.setTitle(dto.getTitle().trim());
        request.setDescription(dto.getDescription());
        request.setContact(dto.getContact());
        request.setLocation(point.getLocation());
        request.setAsset(point.getMainAsset());
        request.setRequestSource(RequestSource.QR);
        request.setQrTag(qrTag);
        request.setPoleCode(point.getPoleCode());
        request.setFaultType(dto.getFaultType());
        request.setScanTimestamp(dto.getScanTimestamp() != null ? dto.getScanTimestamp() : new Date());
        request.setScanLatitude(dto.getScanLatitude());
        request.setScanLongitude(dto.getScanLongitude());
        request.setSafetySeverity(dto.getSafetySeverity());
        request.setPriority(toPriority(dto.getSafetySeverity()));

        return requestService.create(request, point.getCompany());
    }

    @Transactional
    public TrafficLightPoint ensurePointAndActiveQrTagForLocation(Location location) {
        if (location == null || !location.isTrafficLightEnabled()) {
            return null;
        }

        TrafficLightPoint point = trafficLightPointRepository.findByLocation_Id(location.getId())
                .orElseGet(() -> createPointForLocation(location));
        ensureActiveQrTag(point);
        return point;
    }

    public boolean hasPointForLocation(Long locationId) {
        return trafficLightPointRepository.existsByLocation_Id(locationId);
    }

    TrafficLightPointPublicDTO toPublicDto(TrafficLightPoint point) {
        List<WorkOrder> relatedWorkOrders = getRelatedWorkOrders(point);
        List<PreventiveMaintenance> relatedPreventiveMaintenances = getRelatedPreventiveMaintenances(point);
        boolean hasPendingRequest = requestRepository.existsByLocation_IdAndWorkOrderIsNullAndCancelledFalse(
                point.getLocation().getId());
        return buildPublicDto(point, relatedWorkOrders, relatedPreventiveMaintenances, hasPendingRequest);
    }

    private TrafficLightPointPublicDTO buildPublicDto(TrafficLightPoint point, List<WorkOrder> relatedWorkOrders,
                                                      List<PreventiveMaintenance> relatedPreventiveMaintenances,
                                                      boolean hasPendingRequest) {
        Date lastInspectionAt = getLastInspectionAt(relatedWorkOrders);
        Date lastMaintenanceAt = getLastMaintenanceAt(relatedWorkOrders);
        Date nextMaintenanceAt = getNextMaintenanceAt(point, lastInspectionAt, lastMaintenanceAt,
                relatedPreventiveMaintenances);
        TrafficLightPointPublicDTO dto = new TrafficLightPointPublicDTO();
        dto.setId(point.getId());
        dto.setCreatedBy(point.getCreatedBy());
        dto.setUpdatedBy(point.getUpdatedBy());
        dto.setCreatedAt(point.getCreatedAt() == null ? null : point.getCreatedAt().toInstant());
        dto.setUpdatedAt(point.getUpdatedAt() == null ? null : point.getUpdatedAt().toInstant());
        dto.setAtlasLocationId(point.getLocation().getId());
        dto.setPoleCode(point.getPoleCode());
        dto.setName(point.getLocation().getName());
        dto.setAddress(point.getLocation().getAddress());
        dto.setLatitude(point.getLocation().getLatitude());
        dto.setLongitude(point.getLocation().getLongitude());
        dto.setDistrict(point.getDistrict());
        dto.setWard(point.getWard());
        dto.setRoadName(point.getRoadName());
        dto.setIntersectionName(point.getIntersectionName());
        dto.setMainAsset(toMiniAsset(point.getMainAsset()));
        dto.setTrafficLightType(point.getTrafficLightType());
        dto.setControllerType(point.getControllerType());
        dto.setInstallationDate(point.getInstallationDate());
        dto.setMaintenanceCycleDays(point.getMaintenanceCycleDays());
        dto.setLastInspectionAt(lastInspectionAt);
        dto.setLastMaintenanceAt(lastMaintenanceAt);
        dto.setNextMaintenanceAt(nextMaintenanceAt);
        dto.setCurrentStatus(deriveStatus(point, relatedWorkOrders, hasPendingRequest, nextMaintenanceAt));
        dto.setActive(point.isActive());
        return dto;
    }

    TrafficLightMapPointDTO toMapDto(TrafficLightPoint point) {
        return toMapDto(point, getRelatedWorkOrders(point), getRelatedPreventiveMaintenances(point),
                requestRepository.existsByLocation_IdAndWorkOrderIsNullAndCancelledFalse(point.getLocation().getId()));
    }

    private TrafficLightMapPointDTO toMapDto(TrafficLightPoint point, List<WorkOrder> relatedWorkOrders,
                                             List<PreventiveMaintenance> relatedPreventiveMaintenances,
                                             boolean hasPendingRequest) {
        TrafficLightPointPublicDTO publicPoint = buildPublicDto(point, relatedWorkOrders, relatedPreventiveMaintenances,
                hasPendingRequest);
        TrafficLightMapPointDTO dto = new TrafficLightMapPointDTO();
        dto.setId(publicPoint.getId());
        dto.setAtlasLocationId(publicPoint.getAtlasLocationId());
        dto.setPoleCode(publicPoint.getPoleCode());
        dto.setName(publicPoint.getName());
        dto.setAddress(publicPoint.getAddress());
        dto.setLatitude(publicPoint.getLatitude());
        dto.setLongitude(publicPoint.getLongitude());
        dto.setDistrict(publicPoint.getDistrict());
        dto.setWard(publicPoint.getWard());
        dto.setCurrentStatus(publicPoint.getCurrentStatus());
        dto.setLastMaintenanceAt(publicPoint.getLastMaintenanceAt());
        dto.setNextMaintenanceAt(publicPoint.getNextMaintenanceAt());
        return dto;
    }

    TrafficLightStatus deriveStatus(TrafficLightPoint point, List<WorkOrder> relatedWorkOrders,
                                    boolean hasPendingRequest, Date nextMaintenanceAt) {
        if (!point.isActive()) {
            return TrafficLightStatus.INACTIVE;
        }

        boolean hasInProgressWorkOrder = relatedWorkOrders.stream()
                .anyMatch(workOrder -> workOrder.getStatus() == Status.IN_PROGRESS);
        if (hasInProgressWorkOrder) {
            return TrafficLightStatus.IN_PROGRESS;
        }

        boolean hasOpenRepairWork = relatedWorkOrders.stream()
                .anyMatch(workOrder -> workOrder.getStatus() == Status.OPEN || workOrder.getStatus() == Status.ON_HOLD);
        if (hasPendingRequest || hasOpenRepairWork) {
            return TrafficLightStatus.NEEDS_REPAIR;
        }

        if (nextMaintenanceAt != null) {
            Date now = new Date();
            if (nextMaintenanceAt.before(now)) {
                return TrafficLightStatus.MAINTENANCE_OVERDUE;
            }
            if (!nextMaintenanceAt.after(getDueSoonThreshold(point, now))) {
                return TrafficLightStatus.MAINTENANCE_DUE_SOON;
            }
        }

        return TrafficLightStatus.HEALTHY;
    }

    private QrTag resolveActiveQrTag(String qrPublicCode) {
        QrTag qrTag = qrTagRepository.findByQrPublicCodeForResolve(qrPublicCode)
                .orElseThrow(() -> new CustomException("QR tag not found", HttpStatus.NOT_FOUND));
        if (qrTag.getStatus() != QrTagStatus.ACTIVE) {
            throw new CustomException("QR tag is not active", HttpStatus.GONE);
        }
        return qrTag;
    }

    private TrafficLightPoint createPointForLocation(Location location) {
        TrafficLightPoint point = new TrafficLightPoint();
        point.setCompany(location.getCompany());
        point.setLocation(location);
        point.setPoleCode(generatePoleCode(location));
        point.setActive(true);
        return trafficLightPointRepository.saveAndFlush(point);
    }

    private QrTag ensureActiveQrTag(TrafficLightPoint point) {
        return qrTagRepository.findFirstByTrafficLightPoint_IdAndStatusOrderByVersionDesc(point.getId(),
                        QrTagStatus.ACTIVE)
                .orElseGet(() -> createActiveQrTag(point));
    }

    private QrTag createActiveQrTag(TrafficLightPoint point) {
        int nextVersion = qrTagRepository.findTopByTrafficLightPoint_IdOrderByVersionDesc(point.getId())
                .map(QrTag::getVersion)
                .orElse(0) + 1;
        QrTag qrTag = new QrTag();
        qrTag.setCompany(point.getCompany());
        qrTag.setTrafficLightPoint(point);
        qrTag.setVersion(nextVersion);
        qrTag.setStatus(QrTagStatus.ACTIVE);
        qrTag.setQrPublicCode(generateQrPublicCode(point, nextVersion));
        return qrTagRepository.save(qrTag);
    }

    private String generatePoleCode(Location location) {
        String baseCode = location.getCustomId() != null && !location.getCustomId().isBlank()
                ? location.getCustomId().replaceAll("[^A-Za-z0-9]", "").toUpperCase()
                : "LOC" + location.getId();
        return "TL-" + baseCode;
    }

    private String generateQrPublicCode(TrafficLightPoint point, int version) {
        String prefix = String.format("TLQR-C%s-P%s-V%s-", point.getCompany().getId(), point.getId(), version);
        String candidate;
        do {
            candidate = prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (qrTagRepository.existsByQrPublicCode(candidate));
        return candidate;
    }

    private List<WorkOrderMiniDTO> getActiveWorkOrders(TrafficLightPoint point) {
        return getRelatedWorkOrders(point).stream()
                .filter(workOrder -> workOrder.getStatus() != Status.COMPLETE)
                .sorted(Comparator.comparing(WorkOrder::getUpdatedAt).reversed())
                .map(workOrderMapper::toMiniDto)
                .toList();
    }

    private List<WorkOrderMiniDTO> getRecentWorkOrders(TrafficLightPoint point) {
        return getRelatedWorkOrders(point).stream()
                .sorted(Comparator.comparing(this::getHistorySortDate).reversed())
                .limit(10)
                .map(workOrderMapper::toMiniDto)
                .toList();
    }

    private List<WorkOrder> getRelatedWorkOrders(TrafficLightPoint point) {
        Map<Long, WorkOrder> workOrdersById = new LinkedHashMap<>();
        workOrderService.findByLocation(point.getLocation().getId()).forEach(workOrder -> workOrdersById.put(
                workOrder.getId(), workOrder));
        if (point.getMainAsset() != null) {
            workOrderService.findByAsset(point.getMainAsset().getId()).forEach(workOrder -> workOrdersById.put(
                    workOrder.getId(), workOrder));
        }
        return new ArrayList<>(workOrdersById.values());
    }

    private List<PreventiveMaintenance> getRelatedPreventiveMaintenances(TrafficLightPoint point) {
        Map<Long, PreventiveMaintenance> preventiveMaintenancesById = new LinkedHashMap<>();
        preventiveMaintenanceRepository.findByLocationIdWithSchedule(point.getLocation().getId()).forEach(pm ->
                preventiveMaintenancesById.put(pm.getId(), pm));
        if (point.getMainAsset() != null) {
            preventiveMaintenanceRepository.findByAssetIdWithSchedule(point.getMainAsset().getId()).forEach(pm ->
                    preventiveMaintenancesById.put(pm.getId(), pm));
        }
        return new ArrayList<>(preventiveMaintenancesById.values());
    }

    private List<WorkOrder> mergeRelatedWorkOrders(TrafficLightPoint point, Map<Long, List<WorkOrder>> byLocationId,
                                                   Map<Long, List<WorkOrder>> byAssetId) {
        Map<Long, WorkOrder> workOrdersById = new LinkedHashMap<>();
        appendUniqueById(workOrdersById, byLocationId.get(point.getLocation().getId()));
        if (point.getMainAsset() != null) {
            appendUniqueById(workOrdersById, byAssetId.get(point.getMainAsset().getId()));
        }
        return new ArrayList<>(workOrdersById.values());
    }

    private List<PreventiveMaintenance> mergeRelatedPreventiveMaintenances(TrafficLightPoint point,
                                                                           Map<Long, List<PreventiveMaintenance>> byLocationId,
                                                                           Map<Long, List<PreventiveMaintenance>> byAssetId) {
        Map<Long, PreventiveMaintenance> preventiveMaintenancesById = new LinkedHashMap<>();
        appendUniqueById(preventiveMaintenancesById, byLocationId.get(point.getLocation().getId()));
        if (point.getMainAsset() != null) {
            appendUniqueById(preventiveMaintenancesById, byAssetId.get(point.getMainAsset().getId()));
        }
        return new ArrayList<>(preventiveMaintenancesById.values());
    }

    private Date getLastInspectionAt(List<WorkOrder> relatedWorkOrders) {
        return relatedWorkOrders.stream()
                .filter(workOrder -> workOrder.getParentPreventiveMaintenance() != null)
                .filter(workOrder -> workOrder.getStatus() == Status.COMPLETE)
                .map(WorkOrder::getCompletedOn)
                .filter(date -> date != null)
                .max(Date::compareTo)
                .orElse(null);
    }

    private Date getLastMaintenanceAt(List<WorkOrder> relatedWorkOrders) {
        return relatedWorkOrders.stream()
                .filter(workOrder -> workOrder.getStatus() == Status.COMPLETE)
                .map(WorkOrder::getCompletedOn)
                .filter(date -> date != null)
                .max(Date::compareTo)
                .orElse(null);
    }

    private Date getNextMaintenanceAt(TrafficLightPoint point, Date lastInspectionAt, Date lastMaintenanceAt,
                                      List<PreventiveMaintenance> relatedPreventiveMaintenances) {
        Date nextPmMaintenanceAt = getNextPmMaintenanceAt(relatedPreventiveMaintenances);
        if (nextPmMaintenanceAt != null) {
            return nextPmMaintenanceAt;
        }
        if (point.getMaintenanceCycleDays() == null || point.getMaintenanceCycleDays() < 1) {
            return null;
        }
        Date baseline = Optional.ofNullable(lastInspectionAt).orElse(lastMaintenanceAt);
        if (baseline == null) {
            return null;
        }
        return Date.from(baseline.toInstant().plusSeconds(point.getMaintenanceCycleDays() * 24L * 60L * 60L));
    }

    private Date getNextPmMaintenanceAt(List<PreventiveMaintenance> relatedPreventiveMaintenances) {
        return relatedPreventiveMaintenances.stream()
                .map(preventiveMaintenanceMapper::toShowDto)
                .map(PreventiveMaintenanceShowDTO::getNextWorkOrderDate)
                .filter(date -> date != null)
                .min(Date::compareTo)
                .orElse(null);
    }

    private Date getDueSoonThreshold(TrafficLightPoint point, Date now) {
        int cycleDays = point.getMaintenanceCycleDays() == null ? 7 : point.getMaintenanceCycleDays();
        int thresholdDays = Math.min(7, Math.max(1, (int) Math.ceil(cycleDays * 0.2)));
        return Date.from(now.toInstant().plusSeconds(thresholdDays * 24L * 60L * 60L));
    }

    private Date getHistorySortDate(WorkOrder workOrder) {
        if (workOrder.getCompletedOn() != null) {
            return workOrder.getCompletedOn();
        }
        if (workOrder.getUpdatedAt() != null) {
            return workOrder.getUpdatedAt();
        }
        return workOrder.getCreatedAt();
    }

    private TrafficLightPreventiveMaintenanceSummaryDTO toPreventiveMaintenanceSummaryDto(
            PreventiveMaintenance preventiveMaintenance) {
        PreventiveMaintenanceShowDTO pmDto = preventiveMaintenanceMapper.toShowDto(preventiveMaintenance);
        TrafficLightPreventiveMaintenanceSummaryDTO dto = new TrafficLightPreventiveMaintenanceSummaryDTO();
        dto.setId(preventiveMaintenance.getId());
        dto.setName(preventiveMaintenance.getName());
        dto.setCustomId(preventiveMaintenance.getCustomId());
        dto.setSchedule(preventiveMaintenance.getSchedule());
        dto.setNextWorkOrderDate(pmDto.getNextWorkOrderDate());
        return dto;
    }

    private <T> void appendUniqueById(Map<Long, T> target, Collection<T> values) {
        if (values == null) {
            return;
        }
        values.forEach(value -> {
            if (value instanceof WorkOrder workOrder) {
                target.putIfAbsent(workOrder.getId(), value);
            } else if (value instanceof PreventiveMaintenance preventiveMaintenance) {
                target.putIfAbsent(preventiveMaintenance.getId(), value);
            }
        });
    }

    private AssetMiniDTO toMiniAsset(Asset asset) {
        if (asset == null) {
            return null;
        }
        AssetMiniDTO dto = AssetMiniDTO.builder().build();
        dto.setId(asset.getId());
        dto.setName(asset.getName());
        dto.setCustomId(asset.getCustomId());
        dto.setLocationId(asset.getLocation() != null ? asset.getLocation().getId() : null);
        dto.setParentId(asset.getParentAsset() != null ? asset.getParentAsset().getId() : null);
        return dto;
    }

    private Priority toPriority(com.grash.model.enums.SafetySeverity safetySeverity) {
        if (safetySeverity == null) {
            return Priority.NONE;
        }
        return switch (safetySeverity) {
            case LOW -> Priority.LOW;
            case MEDIUM -> Priority.MEDIUM;
            case HIGH, CRITICAL -> Priority.HIGH;
        };
    }
}
