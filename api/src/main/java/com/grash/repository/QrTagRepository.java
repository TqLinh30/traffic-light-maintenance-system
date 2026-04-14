package com.grash.repository;

import com.grash.model.QrTag;
import com.grash.model.enums.QrTagStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QrTagRepository extends JpaRepository<QrTag, Long> {

    boolean existsByQrPublicCode(String qrPublicCode);

    Optional<QrTag> findFirstByTrafficLightPoint_IdAndStatusOrderByVersionDesc(Long trafficLightPointId,
                                                                               QrTagStatus status);

    Optional<QrTag> findTopByTrafficLightPoint_IdOrderByVersionDesc(Long trafficLightPointId);

    @Query("SELECT q FROM QrTag q " +
            "JOIN FETCH q.trafficLightPoint tp " +
            "JOIN FETCH tp.location " +
            "LEFT JOIN FETCH tp.mainAsset " +
            "WHERE q.qrPublicCode = :qrPublicCode")
    Optional<QrTag> findByQrPublicCodeForResolve(@Param("qrPublicCode") String qrPublicCode);
}
