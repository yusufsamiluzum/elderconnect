package com.backend.elderconnect.controllers;

import com.backend.elderconnect.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    AdminService adminService;

    @GetMapping("/officials/pending")
    public ResponseEntity<?> getPendingOfficials() {
        return ResponseEntity.ok(adminService.getPendingOfficials());
    }

    @PutMapping("/officials/{id}/approve")
    public ResponseEntity<?> approveOfficial(@PathVariable Long id, @RequestParam boolean approve) {
        return ResponseEntity.ok(adminService.approveOfficial(id, approve));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteUser(id));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deletePost(id));
    }
}
