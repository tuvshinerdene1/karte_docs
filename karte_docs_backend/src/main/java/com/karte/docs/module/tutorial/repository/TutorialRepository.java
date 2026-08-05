package com.karte.docs.module.tutorial.repository;

import com.karte.docs.module.tutorial.entity.TargetAudience;
import com.karte.docs.module.tutorial.entity.Tutorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorialRepository extends JpaRepository<Tutorial, Long> {

    // 1. Requirement 2.4: Optimized Keyword Search
    // We join the versions and ensure we only search within the CURRENT version
    @Query("SELECT DISTINCT t FROM Tutorial t JOIN t.versions v " +
            "WHERE (LOWER(t.title) LIKE LOWER(concat('%', :kw, '%')) " +
            "OR LOWER(v.content) LIKE LOWER(concat('%', :kw, '%'))) " +
            "AND v.versionNumber = t.currentVersionNumber")
    List<Tutorial> searchByKeyword(@Param("kw") String keyword);

    // using EntityGraph avoids the N+1 problem (fetches versions in 1 query)
    @EntityGraph(attributePaths = {"versions"})
    List<Tutorial> findByTargetAudience(TargetAudience audience);

    // use nativeQuery = true to bypass the @SQLRestriction
    @Query(value = "SELECT * FROM tutorial WHERE deleted_at IS NOT NULL", nativeQuery = true)
    List<Tutorial> findAllDeleted();

    // find a deleted tutorial to restore it
    @Query(value = "SELECT * FROM tutorial WHERE id = :id", nativeQuery = true)
    Optional<Tutorial> findByIdIncludingDeleted(@Param("id") Long id);

    // statistic requirement highest version/activity -
    //TODO: placeholder for statistic requirement
    List<Tutorial> findMostUpdatedTutorials();


}