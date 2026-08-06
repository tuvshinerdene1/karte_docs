package com.karte.docs.module.question.repository;

import com.karte.docs.module.question.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    // basic crud is enough here as answers are linked to questions
}
