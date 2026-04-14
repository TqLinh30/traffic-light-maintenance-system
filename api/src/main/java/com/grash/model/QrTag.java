package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import com.grash.model.enums.QrTagStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.Date;

@Entity
@Table(name = "qr_tag",
        uniqueConstraints = @UniqueConstraint(name = "uk_qr_tag_public_code", columnNames = "qr_public_code"),
        indexes = {
                @Index(name = "idx_qr_tag_public_code", columnList = "qr_public_code"),
                @Index(name = "idx_qr_tag_point_id", columnList = "traffic_light_point_id"),
                @Index(name = "idx_qr_tag_status", columnList = "status")
        })
@Data
@NoArgsConstructor
public class QrTag extends CompanyAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traffic_light_point_id", nullable = false)
    @NotNull
    @OnDelete(action = OnDeleteAction.CASCADE)
    private TrafficLightPoint trafficLightPoint;

    @Column(name = "qr_public_code", nullable = false)
    @NotBlank
    private String qrPublicCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private QrTagStatus status = QrTagStatus.ACTIVE;

    @Column(nullable = false)
    @NotNull
    private Integer version = 1;

    private Date printedAt;

    private Date installedAt;

    private Date deactivatedAt;

    @Column(length = 2000)
    private String notes;
}
