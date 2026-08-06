package com.karte.docs.module.question.entity;

import com.karte.docs.module.auth.entity.User;
import com.karte.docs.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;


@Entity
@Getter @Setter
@SQLDelete(sql = "UPDATE question SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Question extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private QuestionStatus status = QuestionStatus.WAITING;

    @ManyToOne(fetch = FetchType.LAZY)
    private User author;

    // if true, everyone can see this question/answer
    private boolean isPublic = false;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL)
    private Answer answer;
}
