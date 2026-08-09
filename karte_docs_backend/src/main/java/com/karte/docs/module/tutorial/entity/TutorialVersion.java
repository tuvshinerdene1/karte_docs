package com.karte.docs.module.tutorial.entity;

import com.karte.docs.module.auth.entity.User;
import com.karte.docs.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Fetch;


@Entity
@Getter @Setter
public class TutorialVersion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutorial_id")
    private Tutorial tutorial;

    @Column(columnDefinition = "TEXT") // Stores MarkDown for HTML
    private String content;

    private int versionNumber;

    private String changelog; // e.g., update screenshot etc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="author_id")
    private User author;

}
