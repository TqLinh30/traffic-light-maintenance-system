package com.grash.model;

import com.grash.model.abstracts.WorkOrderBase;
import com.grash.model.enums.RequestSource;
import com.grash.model.enums.SafetySeverity;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public class Request extends WorkOrderBase {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String customId;

    private boolean cancelled;

    private String cancellationReason;

    private boolean isDemo;

    @OneToOne(fetch = FetchType.LAZY)
    private File audioDescription;

    @OneToOne(fetch = FetchType.LAZY)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    private RequestPortal requestPortal;

    private String contact;

    @Enumerated(EnumType.STRING)
    private RequestSource requestSource = RequestSource.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    private QrTag qrTag;

    private String poleCode;

    private String faultType;

    private Date scanTimestamp;

    private Double scanLatitude;

    private Double scanLongitude;

    @Enumerated(EnumType.STRING)
    private SafetySeverity safetySeverity;

    @PreRemove
    private void preRemove() {
        if (workOrder != null)
            workOrder.setParentRequest(null);
    }

}

