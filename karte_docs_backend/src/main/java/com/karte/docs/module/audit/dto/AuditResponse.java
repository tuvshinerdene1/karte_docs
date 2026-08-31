package com.karte.docs.module.audit.dto;

import java.time.LocalDateTime;

public record AuditResponse(
        Long id,
        String action,
        String module,
        Long targetId,
        String details,
        String performedByName,
        String performedByEmail,
        LocalDateTime timestamp
) {}
