package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.ApprovalDecisionDTO;
import com.backend.elderconnect.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    AdminService adminService;

    // --- Başvurular (Pending) ---

    @GetMapping("/officials/pending")
    public ResponseEntity<?> getPendingOfficials() {
        return ResponseEntity.ok(adminService.getPendingOfficials());
    }

    @PutMapping("/officials/{id}/approve")
    public ResponseEntity<?> approveOfficial(@PathVariable Long id,
                                              @RequestBody ApprovalDecisionDTO decision) {
        return ResponseEntity.ok(adminService.approveOfficial(id, decision));
    }

    // --- Onaylı Resmi Hesaplar ---

    @GetMapping("/officials/approved")
    public ResponseEntity<?> getApprovedOfficials() {
        return ResponseEntity.ok(adminService.getApprovedOfficials());
    }

    // --- Tüm Kullanıcılar ---

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteUser(id));
    }

    // --- Post Yönetimi ---

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deletePost(id));
    }
}
