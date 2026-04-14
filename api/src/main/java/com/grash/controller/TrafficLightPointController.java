package com.grash.controller;

import com.grash.dto.trafficLight.TrafficLightMapPointDTO;
import com.grash.dto.trafficLight.TrafficLightPointDetailDTO;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import com.grash.service.TrafficLightPointService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/traffic-light-points")
@Tag(name = "trafficLightPoint")
@RequiredArgsConstructor
public class TrafficLightPointController {

    private final TrafficLightPointService trafficLightPointService;
    private final UserService userService;

    @GetMapping("/map")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<TrafficLightMapPointDTO> getMapPoints(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.LOCATIONS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        return trafficLightPointService.getMapPoints(user.getCompany().getId());
    }

    @GetMapping("/location/{locationId}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public TrafficLightPointDetailDTO getByLocation(@PathVariable Long locationId, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getViewPermissions().contains(PermissionEntity.LOCATIONS)) {
            throw new CustomException("Access denied", HttpStatus.FORBIDDEN);
        }
        return trafficLightPointService.getDetailsByLocationId(locationId, user.getCompany().getId());
    }
}
