package com.grash.dto.trafficLight;

import com.grash.model.Schedule;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class TrafficLightPreventiveMaintenanceSummaryDTO {
    private Long id;
    private String name;
    private String customId;
    private Date nextWorkOrderDate;
    private Schedule schedule;
}
