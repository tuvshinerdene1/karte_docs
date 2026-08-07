package com.karte.docs.module.comment.repository;

import com.karte.docs.module.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // find all active comments for specific tutorial
    List<Comment> findByTutorialIdOrderByCreatedAtDesc(Long tutorialId);

    @Query(value = "SELECT  * FROM comment WHERE deleted_at IS NOT NULL", nativeQuery = true)
    List<Comment> findAllDeleted();

    @Query(value = "SELECT * FROM comment WHERE id = :id", nativeQuery = true)
    Optional<Comment> findByIdIncludingDeleted(@Param("id") Long id);
}
