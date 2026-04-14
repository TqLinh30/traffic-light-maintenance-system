package com.grash.repository;

import com.grash.model.TrafficLightPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrafficLightPointRepository extends JpaRepository<TrafficLightPoint, Long> {

    @Query("SELECT tp FROM TrafficLightPoint tp " +
            "JOIN FETCH tp.location " +
            "LEFT JOIN FETCH tp.mainAsset " +
            "WHERE tp.company.id = :companyId")
    List<TrafficLightPoint> findByCompanyIdWithLocation(@Param("companyId") Long companyId);

    @Query("SELECT tp FROM TrafficLightPoint tp " +
            "JOIN FETCH tp.location " +
            "LEFT JOIN FETCH tp.mainAsset " +
            "WHERE tp.id = :id")
    Optional<TrafficLightPoint> findDetailedById(@Param("id") Long id);

    @Query("SELECT tp FROM TrafficLightPoint tp " +
            "JOIN FETCH tp.location " +
            "LEFT JOIN FETCH tp.mainAsset " +
            "WHERE tp.location.id = :locationId AND tp.company.id = :companyId")
    Optional<TrafficLightPoint> findByLocationIdAndCompanyIdWithRelations(@Param("locationId") Long locationId,
                                                                          @Param("companyId") Long companyId);

    Optional<TrafficLightPoint> findByLocation_Id(Long locationId);

    Optional<TrafficLightPoint> findByPoleCodeAndCompany_Id(String poleCode, Long companyId);

    List<TrafficLightPoint> findByCompany_Id(Long companyId);
}
