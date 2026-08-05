package com.karte.docs.module.tutorial.entity;

import com.karte.docs.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter @Setter
@SQLDelete(sql = "UPDATE tutorial SET deleted_at = NOW() WHERE  id = ?")
@SQLRestriction("deleted_at is NULL")
public class Tutorial extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Enumerated(EnumType.STRING)
    private TargetAudience targetAudience;

    @OneToMany(mappedBy = "tutorial", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("versionNumber DESC") // latest version first
    private List<TutorialVersion> versions = new ArrayList<>();

    private int currentVersionNumber = 0;
}
