package com.grash.dto.trafficLight;

import com.grash.dto.workOrder.WorkOrderMiniDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class TrafficLightQrResolveDTO {
    private String qrPublicCode;
    private TrafficLightPointPublicDTO point;
    private List<WorkOrderMiniDTO> activeWorkOrders = new ArrayList<>();
}
