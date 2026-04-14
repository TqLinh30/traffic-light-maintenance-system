package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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
@Table(name = "traffic_light_point",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_traffic_light_point_location", columnNames = "atlas_location_id"),
                @UniqueConstraint(name = "uk_traffic_light_point_company_pole_code", columnNames = {"company_id",
                        "pole_code"})
        },
        indexes = {
                @Index(name = "idx_tlp_location_id", columnList = "atlas_location_id"),
                @Index(name = "idx_tlp_pole_code", columnList = "pole_code"),
                @Index(name = "idx_tlp_is_active", columnList = "is_active"),
                @Index(name = "idx_tlp_main_asset_id", columnList = "main_asset_id")
        })
@Data
@NoArgsConstructor
public class TrafficLightPoint extends CompanyAudit {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atlas_location_id", nullable = false)
    @NotNull
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Location location;

    @Column(name = "pole_code", nullable = false)
    @NotBlank
    private String poleCode;

    private String district;

    private String ward;

    private String roadName;

    private String intersectionName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "main_asset_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Asset mainAsset;

    private String trafficLightType;

    private String controllerType;

    private Date installationDate;

    private Integer maintenanceCycleDays;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
