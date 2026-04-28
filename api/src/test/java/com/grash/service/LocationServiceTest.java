package com.grash.service;

import com.grash.dto.LocationCreateDTO;
import com.grash.dto.LocationPatchDTO;
import com.grash.factory.StorageServiceFactory;
import com.grash.mapper.LocationMapper;
import com.grash.model.Company;
import com.grash.model.File;
import com.grash.model.Location;
import com.grash.model.TrafficLightPoint;
import com.grash.repository.LocationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.MessageSource;

import jakarta.persistence.EntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private UserService userService;

    @Mock
    private CompanyService companyService;

    @Mock
    private CustomerService customerService;

    @Mock
    private MessageSource messageSource;

    @Mock
    private VendorService vendorService;

    @Mock
    private LocationMapper locationMapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TeamService teamService;

    @Mock
    private EntityManager entityManager;

    @Mock
    private FileService fileService;

    @Mock
    private StorageServiceFactory storageServiceFactory;

    @Mock
    private StorageService storageService;

    @Mock
    private CustomSequenceService customSequenceService;

    @Mock
    private TrafficLightPointService trafficLightPointService;

    @InjectMocks
    private LocationService service;

    @Test
    void createShouldProvisionTrafficLightPointWhenEnabled() {
        Company company = new Company();
        company.setId(5L);

        LocationCreateDTO location = new LocationCreateDTO();
        location.setName("Signal pole");
        location.setTrafficLightEnabled(true);

        Location savedLocation = new Location();
        savedLocation.setId(10L);
        savedLocation.setTrafficLightEnabled(true);

        TrafficLightPoint point = new TrafficLightPoint();
        point.setId(100L);

        when(customSequenceService.getNextLocationSequence(company)).thenReturn(7L);
        when(locationMapper.updateLocation(any(Location.class), any(LocationPatchDTO.class))).thenReturn(savedLocation);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trafficLightPointService.ensurePointAndActiveQrTagForLocation(savedLocation)).thenReturn(point);

        Location createdLocation = service.create(location, company);

        assertEquals("L000007", createdLocation.getCustomId());
        verify(trafficLightPointService).ensurePointAndActiveQrTagForLocation(savedLocation);
        verify(trafficLightPointService).syncLocationMetadata(point, location, true);
    }

    @Test
    void createShouldAttachGeneratedImageWithoutFileUploadLicense() {
        Company company = new Company();
        company.setId(5L);

        LocationCreateDTO location = new LocationCreateDTO();
        location.setName("Signal pole");
        location.setTrafficLightEnabled(true);
        location.setGeneratedImageBase64(java.util.Base64.getEncoder().encodeToString("image".getBytes()));
        location.setGeneratedImageFileName("street-view.jpg");
        location.setGeneratedImageContentType("image/jpeg");

        Location savedLocation = new Location();
        savedLocation.setId(10L);
        savedLocation.setTrafficLightEnabled(true);
        savedLocation.setCompany(company);

        TrafficLightPoint point = new TrafficLightPoint();
        point.setId(100L);

        File createdFile = new File();
        createdFile.setId(200L);

        when(customSequenceService.getNextLocationSequence(company)).thenReturn(7L);
        when(locationMapper.updateLocation(any(Location.class), any(LocationPatchDTO.class))).thenReturn(savedLocation);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trafficLightPointService.ensurePointAndActiveQrTagForLocation(savedLocation)).thenReturn(point);
        when(storageServiceFactory.getStorageService()).thenReturn(storageService);
        when(storageService.upload(any(byte[].class), anyString(), anyString(), anyString())).thenReturn("company 5/street-view.jpg");
        when(fileService.create(any(File.class))).thenReturn(createdFile);

        Location createdLocation = service.create(location, company);

        assertEquals(createdFile, createdLocation.getImage());
        verify(storageService).upload(any(byte[].class), anyString(), anyString(), anyString());
        verify(fileService).create(any(File.class));
    }

    @Test
    void updateShouldKeepTrafficLightEnabledWhenPointAlreadyExists() {
        Location existingLocation = new Location();
        existingLocation.setId(12L);
        existingLocation.setTrafficLightEnabled(true);

        LocationPatchDTO patchDTO = new LocationPatchDTO();
        patchDTO.setTrafficLightEnabled(false);

        Location mappedLocation = new Location();
        mappedLocation.setId(12L);
        mappedLocation.setTrafficLightEnabled(false);
        TrafficLightPoint point = new TrafficLightPoint();
        point.setId(22L);

        when(locationRepository.existsById(12L)).thenReturn(true);
        when(locationRepository.findById(12L)).thenReturn(Optional.of(existingLocation));
        when(locationMapper.updateLocation(existingLocation, patchDTO)).thenReturn(mappedLocation);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trafficLightPointService.hasPointForLocation(12L)).thenReturn(true);
        when(trafficLightPointService.ensurePointAndActiveQrTagForLocation(mappedLocation)).thenReturn(point);

        Location updatedLocation = service.update(12L, patchDTO);

        assertTrue(updatedLocation.isTrafficLightEnabled());
        ArgumentCaptor<Location> locationCaptor = ArgumentCaptor.forClass(Location.class);
        verify(locationRepository, times(2)).saveAndFlush(locationCaptor.capture());
        assertTrue(locationCaptor.getAllValues().get(1).isTrafficLightEnabled());
        verify(trafficLightPointService).ensurePointAndActiveQrTagForLocation(updatedLocation);
        verify(trafficLightPointService).syncLocationMetadata(point, patchDTO, false);
    }

    @Test
    void updateShouldReplaceExistingImageWhenGeneratedImageProvided() {
        Company company = new Company();
        company.setId(5L);

        File existingImage = new File();
        existingImage.setId(101L);

        Location existingLocation = new Location();
        existingLocation.setId(12L);
        existingLocation.setCompany(company);
        existingLocation.setImage(existingImage);
        existingLocation.setTrafficLightEnabled(true);

        LocationPatchDTO patchDTO = new LocationPatchDTO();
        patchDTO.setTrafficLightEnabled(true);
        patchDTO.setGeneratedImageBase64(java.util.Base64.getEncoder().encodeToString("updated-image".getBytes()));
        patchDTO.setGeneratedImageFileName("updated-street-view.jpg");
        patchDTO.setGeneratedImageContentType("image/jpeg");

        Location mappedLocation = new Location();
        mappedLocation.setId(12L);
        mappedLocation.setCompany(company);
        mappedLocation.setImage(existingImage);
        mappedLocation.setTrafficLightEnabled(true);

        TrafficLightPoint point = new TrafficLightPoint();
        point.setId(22L);

        File generatedImage = new File();
        generatedImage.setId(202L);

        when(locationRepository.existsById(12L)).thenReturn(true);
        when(locationRepository.findById(12L)).thenReturn(Optional.of(existingLocation));
        when(locationMapper.updateLocation(existingLocation, patchDTO)).thenReturn(mappedLocation);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trafficLightPointService.ensurePointAndActiveQrTagForLocation(mappedLocation)).thenReturn(point);
        when(storageServiceFactory.getStorageService()).thenReturn(storageService);
        when(storageService.upload(any(byte[].class), anyString(), anyString(), anyString())).thenReturn("company 5/updated-street-view.jpg");
        when(fileService.create(any(File.class))).thenReturn(generatedImage);

        Location updatedLocation = service.update(12L, patchDTO);

        assertEquals(generatedImage, updatedLocation.getImage());
        verify(storageService).upload(any(byte[].class), anyString(), anyString(), anyString());
        verify(fileService).create(any(File.class));
        verify(trafficLightPointService).syncLocationMetadata(point, patchDTO, false);
    }

    @Test
    void deleteShouldRemoveTrafficLightPointBeforeLocation() {
        service.delete(12L);

        verify(trafficLightPointService).deletePointForLocation(12L);
        verify(locationRepository).deleteById(12L);
    }
}
