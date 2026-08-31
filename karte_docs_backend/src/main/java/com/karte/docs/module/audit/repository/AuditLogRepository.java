package com.karte.docs.module.audit.repository;

import com.karte.docs.module.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // show newest logs first
    List<AuditLog> findAllByOrderByTimestampDesc();
}
