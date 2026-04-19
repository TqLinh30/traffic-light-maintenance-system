package com.grash.dto.trafficLight;

import com.grash.dto.workOrder.WorkOrderMiniDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class TrafficLightPointDetailDTO {
    private TrafficLightPointPublicDTO point;
    private String activeQrPublicCode;
    private String activeQrPublicUrl;
    private List<TrafficLightPreventiveMaintenanceSummaryDTO> preventiveMaintenances = new ArrayList<>();
    private List<WorkOrderMiniDTO> recentWorkOrders = new ArrayList<>();
}
