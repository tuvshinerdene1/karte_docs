package com.karte.docs.module.question.repository;

import com.karte.docs.module.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository <Question, Long> {
    // everyone can see published Q&A
    List<Question> findByIsPublicTrue();

    // medical staff can see their own history
    List<Question> findByAuthorId(Long authorId);

    // trash bin
    @Query(value = "SELECT * FROM question WHERE deleted_at IS NOT NULL", nativeQuery = true)
    List<Question> findAllDeleted();

    // find deleted to restore
    @Query(value = "SELECT * FROM question WHERE id = :id", nativeQuery = true)
    Optional<Question> findByIdIncludingDeleted(@Param("id") Long id);
}
