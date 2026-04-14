package com.grash.dto.trafficLight;

import com.grash.model.enums.TrafficLightStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class TrafficLightMapPointDTO {
    private Long id;
    private Long atlasLocationId;
    private String poleCode;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String district;
    private String ward;
    private TrafficLightStatus currentStatus;
    private Date lastMaintenanceAt;
    private Date nextMaintenanceAt;
}
