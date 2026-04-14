package com.grash.service;

import com.grash.dto.LocationPatchDTO;
import com.grash.dto.license.LicenseEntitlement;
import com.grash.mapper.LocationMapper;
import com.grash.model.Company;
import com.grash.model.Location;
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
    private CustomSequenceService customSequenceService;

    @Mock
    private LicenseService licenseService;

    @Mock
    private TrafficLightPointService trafficLightPointService;

    @InjectMocks
    private LocationService service;

    @Test
    void createShouldProvisionTrafficLightPointWhenEnabled() {
        Company company = new Company();
        company.setId(5L);

        Location location = new Location();
        location.setId(10L);
        location.setTrafficLightEnabled(true);

        when(licenseService.hasEntitlement(LicenseEntitlement.UNLIMITED_LOCATIONS)).thenReturn(true);
        when(customSequenceService.getNextLocationSequence(company)).thenReturn(7L);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Location savedLocation = service.create(location, company);

        assertEquals("L000007", savedLocation.getCustomId());
        verify(trafficLightPointService).ensurePointAndActiveQrTagForLocation(savedLocation);
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

        when(locationRepository.existsById(12L)).thenReturn(true);
        when(locationRepository.findById(12L)).thenReturn(Optional.of(existingLocation));
        when(locationMapper.updateLocation(existingLocation, patchDTO)).thenReturn(mappedLocation);
        when(locationRepository.saveAndFlush(any(Location.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trafficLightPointService.hasPointForLocation(12L)).thenReturn(true);

        Location updatedLocation = service.update(12L, patchDTO);

        assertTrue(updatedLocation.isTrafficLightEnabled());
        ArgumentCaptor<Location> locationCaptor = ArgumentCaptor.forClass(Location.class);
        verify(locationRepository, times(2)).saveAndFlush(locationCaptor.capture());
        assertTrue(locationCaptor.getAllValues().get(1).isTrafficLightEnabled());
        verify(trafficLightPointService).ensurePointAndActiveQrTagForLocation(updatedLocation);
    }
}
