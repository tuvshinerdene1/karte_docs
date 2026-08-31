package com.karte.docs.module.audit.controller;


import com.karte.docs.module.audit.dto.AuditResponse;
import com.karte.docs.module.audit.entity.AuditLog;
import com.karte.docs.module.audit.service.AuditService;
import com.karte.docs.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;

    @GetMapping
    public ApiResponse<List<AuditResponse>> getLogs() {
        return ApiResponse.success(auditService.getAllLogs(), "Audit logs fetched successfully");
    }
}
