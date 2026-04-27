package com.backend.elderconnect.services;

import com.backend.elderconnect.entities.Event;
import com.backend.elderconnect.entities.Post;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final PostVoteRepository postVoteRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public void updateUserInterests(User user) {
        // 1. En yeni beğenilen postlar
        List<String> likedTitles = postVoteRepository.findByUser(user)
                .stream()
                .filter(vote -> vote.getVoteType().name().equals("UPVOTE"))
                .sorted(Comparator.comparing(v -> v.getPost().getCreatedAt(), Comparator.reverseOrder()))
                .limit(20)
                .map(vote -> vote.getPost().getTitle())
                .collect(Collectors.toList());

        // 2. En yeni yorum yapılan postlar
        List<String> commentedTitles = commentRepository.findByCommenter(user)
                .stream()
                .sorted(Comparator.comparing(com.backend.elderconnect.entities.Comment::getCreatedAt, Comparator.reverseOrder()))
                .limit(20)
                .map(comment -> comment.getPost().getTitle())
                .collect(Collectors.toList());

        // 3. Katılınan etkinlikler
        List<String> eventTitles = eventRepository.findByParticipantsContaining(user)
                .stream()
                .map(Event::getTitle)
                .collect(Collectors.toList());

        // Hepsini birleştir ve en yeni 20 tanesini seç
        List<String> allActivity = new ArrayList<>();
        allActivity.addAll(likedTitles);
        allActivity.addAll(commentedTitles);
        allActivity.addAll(eventTitles);

        if (allActivity.isEmpty()) return;

        // Rastgelelikten kaçınmak için başlıkları temizle ve limit koy
        List<String> recentActivity = allActivity.stream()
                .distinct()
                .limit(20)
                .collect(Collectors.toList());

        String keywords = geminiService.extractKeywords(recentActivity);
        if (!keywords.isEmpty()) {
            user.setInterests(keywords);
            userRepository.save(user);
        }
    }

    public List<Post> getRecommendedPosts(User user) {
        String interests = user.getInterests();
        if (interests == null || interests.isEmpty()) {
            return postRepository.findAll().stream()
                    .sorted(Comparator.comparing(Post::getScore).reversed())
                    .limit(10)
                    .collect(Collectors.toList());
        }

        String[] keywords = interests.split(",");
        Set<Post> recommendedSet = new HashSet<>();

        for (String keyword : keywords) {
            recommendedSet.addAll(postRepository.findByKeyword(keyword.trim()));
        }

        return recommendedSet.stream()
                .sorted(Comparator.comparing(Post::getCreatedAt).reversed())
                .limit(20)
                .collect(Collectors.toList());
    }

    public List<Event> getRecommendedEvents(User user) {
        String interests = user.getInterests();
        if (interests == null || interests.isEmpty()) {
            return eventRepository.findUpcomingEvents().stream()
                    .limit(5)
                    .collect(Collectors.toList());
        }

        String[] keywords = interests.split(",");
        Set<Event> recommendedSet = new HashSet<>();

        for (String keyword : keywords) {
            recommendedSet.addAll(eventRepository.findByKeyword(keyword.trim()));
        }

        return recommendedSet.stream()
                .sorted(Comparator.comparing(Event::getEventDate))
                .limit(10)
                .collect(Collectors.toList());
    }
}
