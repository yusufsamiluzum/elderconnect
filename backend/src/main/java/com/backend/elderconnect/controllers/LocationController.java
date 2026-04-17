package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.LocationDTO;
import com.backend.elderconnect.dto.MessageResponse;
import com.backend.elderconnect.services.LocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class LocationController {
    @Autowired
    LocationService locationService;

    @GetMapping("/locations")
    public ResponseEntity<?> searchLocations(
            @RequestParam String city,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(locationService.searchLocations(city, type));
    }

    @GetMapping("/communities/{id}/locations")
    public ResponseEntity<?> getCommunityLocations(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getCommunityLocations(id));
    }

    @PostMapping("/communities/{id}/locations")
    public ResponseEntity<?> addLocation(@PathVariable Long id, @Valid @RequestBody LocationDTO locationDTO) {
        return ResponseEntity.ok(locationService.addLocation(id, locationDTO));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationDTO locationDTO) {
        return ResponseEntity.ok(locationService.updateLocation(id, locationDTO));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(new MessageResponse("Location deleted successfully!"));
    }
}
