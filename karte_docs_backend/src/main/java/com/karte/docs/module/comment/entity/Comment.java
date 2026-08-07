package com.karte.docs.module.comment.entity;

import com.karte.docs.module.auth.entity.User;
import com.karte.docs.module.tutorial.entity.Tutorial;
import com.karte.docs.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;


@Entity
@Getter
@Setter
@SQLDelete(sql="UPDATE comment SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Comment extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="tutorial_id")
    private Tutorial tutorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="author_id")
    private User author;

}
