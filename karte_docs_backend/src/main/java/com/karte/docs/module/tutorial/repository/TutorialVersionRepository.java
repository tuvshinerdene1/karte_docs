package com.karte.docs.module.tutorial.repository;

import com.karte.docs.module.tutorial.entity.TutorialVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TutorialVersionRepository extends JpaRepository<TutorialVersion, Long>{
    // get all versions of a tutorial, ordered by newest first
    List<TutorialVersion> findByTutorialIdOrderByVersionNumberDesc(Long tutorialId);
}
