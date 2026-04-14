package com.grash.dto;

import com.grash.dto.requestPortal.RequestPortalMiniDTO;
import com.grash.dto.workOrder.WorkOrderMiniDTO;
import com.grash.model.enums.RequestSource;
import com.grash.model.enums.SafetySeverity;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
public class RequestShowDTO extends WorkOrderBaseShowDTO {
    private boolean cancelled;

    private String cancellationReason;

    private WorkOrderMiniDTO workOrder;

    private FileMiniDTO audioDescription;

    private String customId;

    private RequestPortalMiniDTO requestPortal;

    private String contact;

    private RequestSource requestSource;

    private Long qrTagId;

    private String poleCode;

    private String faultType;

    private Date scanTimestamp;

    private Double scanLatitude;

    private Double scanLongitude;

    private SafetySeverity safetySeverity;
}
