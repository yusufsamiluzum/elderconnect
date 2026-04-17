package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.LocationDTO;
import com.backend.elderconnect.entities.Community;
import com.backend.elderconnect.entities.Location;
import com.backend.elderconnect.repositories.CommunityRepository;
import com.backend.elderconnect.repositories.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {
    @Autowired
    LocationRepository locationRepository;

    @Autowired
    CommunityRepository communityRepository;

    public List<LocationDTO> searchLocations(String city, String type) {
        // Simple search by city for now, 'type' could be expanded later
        List<Location> locations = locationRepository.findByCity(city);
        return locations.stream()
                .map(this::mapLocationToDTO)
                .collect(Collectors.toList());
    }

    public List<LocationDTO> getCommunityLocations(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        return locationRepository.findByCommunity(community).stream()
                .map(this::mapLocationToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LocationDTO addLocation(Long communityId, LocationDTO locationDTO) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Error: Community not found."));

        Location location = new Location();
        location.setName(locationDTO.getName());
        location.setPictureUrl(locationDTO.getPictureUrl());
        location.setAddressLine1(locationDTO.getAddressLine1());
        location.setCity(locationDTO.getCity());
        location.setLatitude(locationDTO.getLatitude());
        location.setLongitude(locationDTO.getLongitude());
        location.setCommunity(community);

        location = locationRepository.save(location);
        return mapLocationToDTO(location);
    }

    @Transactional
    public LocationDTO updateLocation(Long id, LocationDTO locationDTO) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Location not found."));

        if (locationDTO.getName() != null) location.setName(locationDTO.getName());
        if (locationDTO.getPictureUrl() != null) location.setPictureUrl(locationDTO.getPictureUrl());
        if (locationDTO.getAddressLine1() != null) location.setAddressLine1(locationDTO.getAddressLine1());
        if (locationDTO.getCity() != null) location.setCity(locationDTO.getCity());
        if (locationDTO.getLatitude() != null) location.setLatitude(locationDTO.getLatitude());
        if (locationDTO.getLongitude() != null) location.setLongitude(locationDTO.getLongitude());

        location = locationRepository.save(location);
        return mapLocationToDTO(location);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Location not found."));
        locationRepository.delete(location);
    }

    private LocationDTO mapLocationToDTO(Location location) {
        return LocationDTO.builder()
                .id(location.getId())
                .name(location.getName())
                .pictureUrl(location.getPictureUrl())
                .addressLine1(location.getAddressLine1())
                .city(location.getCity())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .build();
    }
}
