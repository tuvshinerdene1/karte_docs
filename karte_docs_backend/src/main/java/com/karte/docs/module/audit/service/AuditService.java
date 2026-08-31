package com.karte.docs.module.audit.service;


import com.karte.docs.module.audit.entity.AuditLog;
import com.karte.docs.module.audit.repository.AuditLogRepository;
import com.karte.docs.module.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.karte.docs.module.audit.dto.AuditResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String module, Long targetId, String details, User user){
        AuditLog log = new AuditLog(action, module, targetId, details, user);
        auditLogRepository.save(log);
    }

    public List<AuditResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    private AuditResponse mapToResponse(AuditLog log) {
        return new AuditResponse(
                log.getId(),
                log.getAction(),
                log.getModule(),
                log.getTargetId(),
                log.getDetails(),
                log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "System",
                log.getPerformedBy() != null ? log.getPerformedBy().getEmail() : "N/A",
                log.getTimestamp()
        );
    }
}
