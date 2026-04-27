package com.backend.elderconnect.controllers;

import com.backend.elderconnect.dto.EventResponseDTO;
import com.backend.elderconnect.entities.Event;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.UserRole;
import com.backend.elderconnect.repositories.EventRepository;
import com.backend.elderconnect.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<Event> events = eventRepository.findUpcomingEvents();
        return ResponseEntity.ok(events.stream().map(this::mapToDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRoles().contains(UserRole.ROLE_OFFICIAL) && !user.getRoles().contains(UserRole.ROLE_ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only official organizations can create events.");
        }

        event.setOrganizer(user);
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(mapToDTO(saved));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinEvent(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.getParticipants().add(user);
        eventRepository.save(event);
        return ResponseEntity.ok("Successfully joined the event.");
    }

    private EventResponseDTO mapToDTO(Event event) {
        return EventResponseDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .locationName(event.getLocationName())
                .address(event.getAddress())
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getName() : "Bilinmeyen")
                .pictureUrl(event.getPictureUrl())
                .participantCount(event.getParticipants() != null ? event.getParticipants().size() : 0)
                .build();
    }
}
