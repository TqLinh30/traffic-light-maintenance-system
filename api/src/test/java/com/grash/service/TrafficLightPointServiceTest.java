package com.grash.service;

import com.grash.dto.AssetMiniDTO;
import com.grash.dto.PreventiveMaintenanceShowDTO;
import com.grash.dto.trafficLight.TrafficLightMapPointDTO;
import com.grash.dto.trafficLight.TrafficLightPointDetailDTO;
import com.grash.dto.trafficLight.TrafficLightPointPublicDTO;
import com.grash.dto.trafficLight.TrafficLightQrRequestCreateDTO;
import com.grash.exception.CustomException;
import com.grash.mapper.PreventiveMaintenanceMapper;
import com.grash.mapper.WorkOrderMapper;
import com.grash.model.Asset;
import com.grash.model.Company;
import com.grash.model.Location;
import com.grash.model.PreventiveMaintenance;
import com.grash.model.QrTag;
import com.grash.model.Request;
import com.grash.model.TrafficLightPoint;
import com.grash.model.WorkOrder;
import com.grash.model.enums.Priority;
import com.grash.model.enums.QrTagStatus;
import com.grash.model.enums.SafetySeverity;
import com.grash.model.enums.Status;
import com.grash.model.enums.TrafficLightStatus;
import com.grash.repository.PreventiveMaintenanceRepository;
import com.grash.repository.QrTagRepository;
import com.grash.repository.RequestRepository;
import com.grash.repository.TrafficLightPointRepository;
import com.grash.repository.WorkOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrafficLightPointServiceTest {

    @Mock
    private TrafficLightPointRepository trafficLightPointRepository;

    @Mock
    private QrTagRepository qrTagRepository;

    @Mock
    private RequestRepository requestRepository;

    @Mock
    private PreventiveMaintenanceRepository preventiveMaintenanceRepository;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private RequestService requestService;

    @Mock
    private WorkOrderService workOrderService;

    @Mock
    private PreventiveMaintenanceMapper preventiveMaintenanceMapper;

    @Mock
    private WorkOrderMapper workOrderMapper;

    @InjectMocks
    private TrafficLightPointService service;

    @Test
    void createRequestFromQrShouldPopulateTrafficLightMetadata() {
        Company company = new Company();
        Asset asset = new Asset();
        asset.setId(55L);
        Location location = new Location();
        location.setId(10L);
        TrafficLightPoint point = createPoint(company, location, asset);

        QrTag qrTag = new QrTag();
        qrTag.setStatus(QrTagStatus.ACTIVE);
        qrTag.setTrafficLightPoint(point);

        TrafficLightQrRequestCreateDTO dto = new TrafficLightQrRequestCreateDTO();
        dto.setTitle(" Lamp outage ");
        dto.setDescription("Northbound red lamp is off");
        dto.setContact("citizen@example.com");
        dto.setFaultType("LAMP_OUT");
        dto.setSafetySeverity(SafetySeverity.HIGH);
        Date scanTimestamp = Date.from(Instant.parse("2026-04-12T08:00:00Z"));
        dto.setScanTimestamp(scanTimestamp);
        dto.setScanLatitude(25.0422);
        dto.setScanLongitude(121.5645);

        when(qrTagRepository.findByQrPublicCodeForResolve("QR-001")).thenReturn(Optional.of(qrTag));
        when(requestService.create(any(Request.class), eq(company))).thenAnswer(invocation -> invocation.getArgument(0));

        Request createdRequest = service.createRequestFromQr("QR-001", dto);

        ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
        verify(requestService).create(requestCaptor.capture(), eq(company));
        Request request = requestCaptor.getValue();

        assertSame(createdRequest, request);
        assertEquals("Lamp outage", request.getTitle());
        assertEquals(dto.getDescription(), request.getDescription());
        assertEquals(dto.getContact(), request.getContact());
        assertSame(location, request.getLocation());
        assertSame(asset, request.getAsset());
        assertEquals("TL-001", request.getPoleCode());
        assertEquals("LAMP_OUT", request.getFaultType());
        assertEquals(scanTimestamp, request.getScanTimestamp());
        assertEquals(25.0422, request.getScanLatitude());
        assertEquals(121.5645, request.getScanLongitude());
        assertEquals(SafetySeverity.HIGH, request.getSafetySeverity());
        assertEquals(Priority.HIGH, request.getPriority());
    }

    @Test
    void createRequestFromQrShouldRejectDisabledQrTags() {
        QrTag qrTag = new QrTag();
        qrTag.setStatus(QrTagStatus.DISABLED);
        qrTag.setTrafficLightPoint(createPoint(new Company(), new Location(), null));
        when(qrTagRepository.findByQrPublicCodeForResolve("QR-DISABLED")).thenReturn(Optional.of(qrTag));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createRequestFromQr("QR-DISABLED", new TrafficLightQrRequestCreateDTO()));

        assertEquals(HttpStatus.GONE, exception.getHttpStatus());
        assertEquals("QR tag is not active", exception.getMessage());
    }

    @Test
    void toPublicDtoShouldConvertAuditDatesAndDeriveMaintenanceDueSoonStatus() {
        Company company = new Company();
        Asset asset = new Asset();
        asset.setId(55L);
        asset.setName("Signal cabinet");
        asset.setCustomId("ASSET-55");
        Location assetLocation = new Location();
        assetLocation.setId(10L);
        asset.setLocation(assetLocation);

        Location location = new Location();
        location.setId(10L);
        location.setName("Renai / Xinyi");
        location.setAddress("Renai Rd & Xinyi Rd");
        location.setLatitude(25.0330);
        location.setLongitude(121.5654);

        TrafficLightPoint point = createPoint(company, location, asset);
        point.setId(99L);
        point.setDistrict("Da'an");
        point.setWard("Ward 3");
        point.setRoadName("Renai Road");
        point.setIntersectionName("Renai / Xinyi");
        point.setTrafficLightType("Vehicle");
        point.setControllerType("ATC");
        point.setInstallationDate(Date.from(Instant.parse("2020-01-01T00:00:00Z")));
        point.setMaintenanceCycleDays(30);
        point.setCreatedBy(7L);
        point.setUpdatedBy(9L);
        Date createdAt = Date.from(Instant.parse("2026-01-01T00:00:00Z"));
        Date updatedAt = Date.from(Instant.parse("2026-04-10T00:00:00Z"));
        point.setCreatedAt(createdAt);
        point.setUpdatedAt(updatedAt);

        WorkOrder completedPmWorkOrder = new WorkOrder();
        completedPmWorkOrder.setId(500L);
        completedPmWorkOrder.setStatus(Status.COMPLETE);
        completedPmWorkOrder.setCompletedOn(Date.from(Instant.now().minus(29, ChronoUnit.DAYS)));
        completedPmWorkOrder.setParentPreventiveMaintenance(new PreventiveMaintenance());

        when(workOrderService.findByLocation(10L)).thenReturn(List.of(completedPmWorkOrder));
        when(workOrderService.findByAsset(55L)).thenReturn(List.of());
        when(preventiveMaintenanceRepository.findByLocationIdWithSchedule(10L)).thenReturn(List.of());
        when(preventiveMaintenanceRepository.findByAssetIdWithSchedule(55L)).thenReturn(List.of());
        when(requestRepository.existsByLocation_IdAndWorkOrderIsNullAndCancelledFalse(10L)).thenReturn(false);

        TrafficLightPointPublicDTO dto = service.toPublicDto(point);

        assertNotNull(dto);
        assertEquals(99L, dto.getId());
        assertEquals(createdAt.toInstant(), dto.getCreatedAt());
        assertEquals(updatedAt.toInstant(), dto.getUpdatedAt());
        assertEquals(TrafficLightStatus.MAINTENANCE_DUE_SOON, dto.getCurrentStatus());
        assertEquals("Renai / Xinyi", dto.getName());
        assertEquals("Renai Rd & Xinyi Rd", dto.getAddress());
        assertEquals("Da'an", dto.getDistrict());
        assertEquals("Ward 3", dto.getWard());
        AssetMiniDTO mainAsset = dto.getMainAsset();
        assertNotNull(mainAsset);
        assertEquals(55L, mainAsset.getId());
        assertEquals("Signal cabinet", mainAsset.getName());
        assertEquals("ASSET-55", mainAsset.getCustomId());
        assertNotNull(dto.getLastInspectionAt());
        assertNotNull(dto.getLastMaintenanceAt());
        assertNotNull(dto.getNextMaintenanceAt());
    }

    @Test
    void getMapPointsShouldReturnDerivedStatusSummariesWithCoordinatesOnly() {
        Company company = new Company();

        Location mappedLocation = new Location();
        mappedLocation.setId(10L);
        mappedLocation.setName("Renai / Xinyi");
        mappedLocation.setAddress("Renai Rd & Xinyi Rd");
        mappedLocation.setLatitude(25.0330);
        mappedLocation.setLongitude(121.5654);

        TrafficLightPoint mappedPoint = createPoint(company, mappedLocation, null);
        mappedPoint.setId(100L);
        mappedPoint.setDistrict("Da'an");
        mappedPoint.setWard("Ward 3");
        mappedPoint.setMaintenanceCycleDays(30);

        Location unmappedLocation = new Location();
        unmappedLocation.setId(11L);
        unmappedLocation.setName("No Coordinates");

        TrafficLightPoint unmappedPoint = createPoint(company, unmappedLocation, null);
        unmappedPoint.setId(101L);

        when(trafficLightPointRepository.findByCompanyIdWithLocation(5L)).thenReturn(List.of(mappedPoint, unmappedPoint));
        when(workOrderRepository.findByLocationIdsWithDetails(anyCollection())).thenReturn(List.of());
        when(preventiveMaintenanceRepository.findByLocationIdsWithSchedule(anyCollection())).thenReturn(List.of());
        when(requestRepository.findOpenLocationIds(anyCollection())).thenReturn(List.of());

        List<TrafficLightMapPointDTO> result = service.getMapPoints(5L);

        assertEquals(1, result.size());
        TrafficLightMapPointDTO mapPoint = result.get(0);
        assertEquals(100L, mapPoint.getId());
        assertEquals(10L, mapPoint.getAtlasLocationId());
        assertEquals("TL-001", mapPoint.getPoleCode());
        assertEquals("Renai / Xinyi", mapPoint.getName());
        assertEquals("Da'an", mapPoint.getDistrict());
        assertEquals(TrafficLightStatus.HEALTHY, mapPoint.getCurrentStatus());
    }

    @Test
    void toPublicDtoShouldPreferPreventiveMaintenanceNextWorkOrderDate() {
        Company company = new Company();
        Location location = new Location();
        location.setId(10L);
        location.setName("Renai / Xinyi");
        location.setAddress("Renai Rd & Xinyi Rd");
        location.setLatitude(25.0330);
        location.setLongitude(121.5654);

        TrafficLightPoint point = createPoint(company, location, null);
        point.setId(200L);
        point.setMaintenanceCycleDays(30);

        PreventiveMaintenance preventiveMaintenance = new PreventiveMaintenance();
        preventiveMaintenance.setId(300L);
        preventiveMaintenance.setName("Quarterly inspection");
        preventiveMaintenance.setCustomId("PM-300");

        PreventiveMaintenanceShowDTO pmDto = new PreventiveMaintenanceShowDTO();
        Date nextWorkOrderDate = Date.from(Instant.now().plus(2, ChronoUnit.DAYS));
        pmDto.setNextWorkOrderDate(nextWorkOrderDate);

        when(workOrderService.findByLocation(10L)).thenReturn(List.of());
        when(preventiveMaintenanceRepository.findByLocationIdWithSchedule(10L))
                .thenReturn(List.of(preventiveMaintenance));
        when(preventiveMaintenanceMapper.toShowDto(preventiveMaintenance)).thenReturn(pmDto);
        when(requestRepository.existsByLocation_IdAndWorkOrderIsNullAndCancelledFalse(10L)).thenReturn(false);

        TrafficLightPointPublicDTO dto = service.toPublicDto(point);

        assertEquals(nextWorkOrderDate, dto.getNextMaintenanceAt());
        assertEquals(TrafficLightStatus.MAINTENANCE_DUE_SOON, dto.getCurrentStatus());
    }

    @Test
    void getDetailsByLocationIdShouldReturnPointPmSummariesAndRecentWorkOrders() {
        ReflectionTestUtils.setField(service, "frontendUrl", "http://localhost:3000");
        Company company = new Company();
        company.setId(5L);

        Location location = new Location();
        location.setId(10L);
        location.setName("Renai / Xinyi");
        location.setAddress("Renai Rd & Xinyi Rd");
        location.setLatitude(25.0330);
        location.setLongitude(121.5654);

        TrafficLightPoint point = createPoint(company, location, null);
        point.setId(400L);

        PreventiveMaintenance preventiveMaintenance = new PreventiveMaintenance();
        preventiveMaintenance.setId(600L);
        preventiveMaintenance.setName("Monthly inspection");
        preventiveMaintenance.setCustomId("PM-600");

        PreventiveMaintenanceShowDTO pmDto = new PreventiveMaintenanceShowDTO();
        Date nextWorkOrderDate = Date.from(Instant.now().plus(5, ChronoUnit.DAYS));
        pmDto.setNextWorkOrderDate(nextWorkOrderDate);

        WorkOrder recentWorkOrder = new WorkOrder();
        recentWorkOrder.setId(700L);
        recentWorkOrder.setTitle("Inspect controller");
        recentWorkOrder.setStatus(Status.COMPLETE);
        recentWorkOrder.setCreatedAt(Date.from(Instant.now().minus(10, ChronoUnit.DAYS)));
        recentWorkOrder.setCompletedOn(Date.from(Instant.now().minus(1, ChronoUnit.DAYS)));

        com.grash.dto.workOrder.WorkOrderMiniDTO recentWorkOrderDto =
                new com.grash.dto.workOrder.WorkOrderMiniDTO();
        recentWorkOrderDto.setId(700L);
        recentWorkOrderDto.setTitle("Inspect controller");
        recentWorkOrderDto.setStatus(Status.COMPLETE);
        recentWorkOrderDto.setCreatedAt(recentWorkOrder.getCreatedAt());

        when(trafficLightPointRepository.findByLocationIdAndCompanyIdWithRelations(10L, 5L))
                .thenReturn(Optional.of(point));
        QrTag activeQrTag = new QrTag();
        activeQrTag.setId(800L);
        activeQrTag.setStatus(QrTagStatus.ACTIVE);
        activeQrTag.setVersion(1);
        activeQrTag.setTrafficLightPoint(point);
        activeQrTag.setQrPublicCode("QR-DETAIL-001");
        when(qrTagRepository.findFirstByTrafficLightPoint_IdAndStatusOrderByVersionDesc(400L, QrTagStatus.ACTIVE))
                .thenReturn(Optional.of(activeQrTag));
        when(workOrderService.findByLocation(10L)).thenReturn(List.of(recentWorkOrder));
        when(preventiveMaintenanceRepository.findByLocationIdWithSchedule(10L))
                .thenReturn(List.of(preventiveMaintenance));
        when(preventiveMaintenanceMapper.toShowDto(preventiveMaintenance)).thenReturn(pmDto);
        when(workOrderMapper.toMiniDto(recentWorkOrder)).thenReturn(recentWorkOrderDto);
        when(requestRepository.existsByLocation_IdAndWorkOrderIsNullAndCancelledFalse(10L)).thenReturn(false);

        TrafficLightPointDetailDTO dto = service.getDetailsByLocationId(10L, 5L);

        assertNotNull(dto.getPoint());
        assertEquals("QR-DETAIL-001", dto.getActiveQrPublicCode());
        assertEquals("http://localhost:3000/traffic-light/QR-DETAIL-001", dto.getActiveQrPublicUrl());
        assertEquals(1, dto.getPreventiveMaintenances().size());
        assertEquals(600L, dto.getPreventiveMaintenances().get(0).getId());
        assertEquals(nextWorkOrderDate, dto.getPreventiveMaintenances().get(0).getNextWorkOrderDate());
        assertEquals(1, dto.getRecentWorkOrders().size());
        assertEquals(700L, dto.getRecentWorkOrders().get(0).getId());
    }

    @Test
    void ensurePointAndActiveQrTagForLocationShouldCreatePointAndQrTag() {
        Company company = new Company();
        company.setId(5L);

        Location location = new Location();
        location.setId(10L);
        location.setCustomId("L000010");
        location.setTrafficLightEnabled(true);
        location.setCompany(company);

        when(trafficLightPointRepository.findByLocation_Id(10L)).thenReturn(Optional.empty());
        when(trafficLightPointRepository.saveAndFlush(any(TrafficLightPoint.class))).thenAnswer(invocation -> {
            TrafficLightPoint savedPoint = invocation.getArgument(0);
            savedPoint.setId(900L);
            return savedPoint;
        });
        when(qrTagRepository.findFirstByTrafficLightPoint_IdAndStatusOrderByVersionDesc(900L, QrTagStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(qrTagRepository.findTopByTrafficLightPoint_IdOrderByVersionDesc(900L)).thenReturn(Optional.empty());
        when(qrTagRepository.existsByQrPublicCode(any(String.class))).thenReturn(false);
        when(qrTagRepository.save(any(QrTag.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrafficLightPoint point = service.ensurePointAndActiveQrTagForLocation(location);

        assertNotNull(point);
        assertEquals(900L, point.getId());
        assertEquals("TL-L000010", point.getPoleCode());

        ArgumentCaptor<QrTag> qrTagCaptor = ArgumentCaptor.forClass(QrTag.class);
        verify(qrTagRepository).save(qrTagCaptor.capture());
        QrTag savedQrTag = qrTagCaptor.getValue();
        assertEquals(point, savedQrTag.getTrafficLightPoint());
        assertEquals(QrTagStatus.ACTIVE, savedQrTag.getStatus());
        assertEquals(1, savedQrTag.getVersion());
        assertTrue(savedQrTag.getQrPublicCode().startsWith("TLQR-C5-P900-V1-"));
    }

    private TrafficLightPoint createPoint(Company company, Location location, Asset asset) {
        TrafficLightPoint point = new TrafficLightPoint();
        point.setCompany(company);
        point.setLocation(location);
        point.setMainAsset(asset);
        point.setPoleCode("TL-001");
        point.setActive(true);
        return point;
    }
}
