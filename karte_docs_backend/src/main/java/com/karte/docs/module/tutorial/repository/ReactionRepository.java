package com.karte.docs.module.tutorial.repository;

import com.karte.docs.module.tutorial.entity.Reaction;
import com.karte.docs.module.tutorial.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    // Find if a specific user already reacted to a specific tutorial
    Optional<Reaction> findByUserIdAndTutorialId(Long userId, Long tutorialId);

    // Counts for statistics
    long countByTutorialIdAndType(Long tutorialId, ReactionType type);
}
