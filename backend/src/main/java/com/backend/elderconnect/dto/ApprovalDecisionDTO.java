package com.backend.elderconnect.dto;

import lombok.Data;

@Data
public class ApprovalDecisionDTO {
    private boolean approve;
    private String rejectionReason;
}
