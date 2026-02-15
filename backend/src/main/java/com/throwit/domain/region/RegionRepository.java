package com.throwit.domain.region;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RegionRepository extends JpaRepository<Region, Long> {

    @Query("SELECT r FROM Region r WHERE r.city LIKE %:query% OR r.district LIKE %:query% OR r.dong LIKE %:query%")
    List<Region> searchByQuery(@Param("query") String query);
}
