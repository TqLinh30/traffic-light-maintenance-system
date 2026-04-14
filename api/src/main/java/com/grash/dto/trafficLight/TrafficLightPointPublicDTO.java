package com.grash.dto.trafficLight;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.grash.dto.AssetMiniDTO;
import com.grash.dto.AuditShowDTO;
import com.grash.model.enums.TrafficLightStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TrafficLightPointPublicDTO extends AuditShowDTO {
    private Long atlasLocationId;
    private String poleCode;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String district;
    private String ward;
    private String roadName;
    private String intersectionName;
    private AssetMiniDTO mainAsset;
    private String trafficLightType;
    private String controllerType;
    private Date installationDate;
    private Integer maintenanceCycleDays;
    private Date lastInspectionAt;
    private Date lastMaintenanceAt;
    private Date nextMaintenanceAt;
    private TrafficLightStatus currentStatus;
    @JsonProperty("isActive")
    private boolean active;
}
