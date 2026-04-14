package com.backend.elderconnect.controllers;

import com.backend.elderconnect.services.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/search")
public class SearchController {
    @Autowired
    SearchService searchService;

    @GetMapping
    public ResponseEntity<?> globalSearch(
            @RequestParam String q,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(searchService.globalSearch(q, type));
    }
}
