package com.karte.docs.module.audit.entity;

import com.karte.docs.module.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String module;
    private Long targetId;
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User performedBy;

    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog(String action, String module, Long targetId, String details, User performedBy){
        this.action = action;
        this.module = module;
        this.targetId = targetId;
        this.details = details;
        this.performedBy = performedBy;
    }
}
