package com.backend.elderconnect.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key:}")
    private String apiKey;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractKeywords(List<String> titles) {
        if (apiKey == null || apiKey.isEmpty() || titles.isEmpty()) return "";
        String prompt = "Aşağıdaki paylaşımları beğenen bir kullanıcının ilgi alanlarını temsil eden tam olarak 5 adet anahtar kelime (Türkçe) belirle. Sadece kelimeleri aralarında virgül olacak şekilde döndür. Başka hiçbir açıklama yapma.\n\nPaylaşımlar:\n" + String.join("\n", titles);
        return callGroqWithRetry(prompt);
    }

    public String analyzeContent(String title, String content) {
        if (apiKey == null || apiKey.isEmpty()) return "";
        String prompt = String.format(
            "Aşağıdaki içeriği analiz et ve bu içeriği en iyi temsil eden 3 adet anahtar kelime (Türkçe) belirle. " +
            "Sadece kelimeleri aralarında virgül olacak şekilde döndür. Başka hiçbir açıklama yapma.\n\nBaşlık: %s\nİçerik: %s",
            title, content
        );
        return callGroqWithRetry(prompt);
    }

    private String callGroqWithRetry(String prompt) {
        int maxRetries = 5;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                return callGroq(prompt);
            } catch (HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                System.out.println(">>> Groq Limitine Takıldı (429). 10 saniye bekleniyor... Deneme: " + retryCount);
                try {
                    Thread.sleep(10000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                System.err.println("Groq API Beklenmedik Hata: " + e.getMessage());
                break;
            }
        }
        return "";
    }

    private String callGroq(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> body = Map.of(
            "model", MODEL,
            "messages", List.of(message)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(API_URL, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            String result = root.path("choices").get(0).path("message").path("content").asText();
            return result.trim().replace("\n", "").toLowerCase();
        }
        return "";
    }
}
