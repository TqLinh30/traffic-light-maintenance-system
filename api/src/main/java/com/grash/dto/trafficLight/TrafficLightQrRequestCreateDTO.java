package com.grash.dto.trafficLight;

import com.grash.model.enums.SafetySeverity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class TrafficLightQrRequestCreateDTO {
    @NotBlank
    private String title;

    private String description;

    private String contact;

    private String faultType;

    private Date scanTimestamp;

    private Double scanLatitude;

    private Double scanLongitude;

    private SafetySeverity safetySeverity;
}
