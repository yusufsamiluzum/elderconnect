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
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractKeywords(List<String> titles) {
        if (apiKey == null || apiKey.isEmpty() || titles.isEmpty()) return "";
        String prompt = "Aşağıdaki paylaşımları beğenen bir kullanıcının ilgi alanlarını temsil eden tam olarak 5 adet anahtar kelime (Türkçe) belirle. Sadece kelimeleri aralarında virgül olacak şekilde döndür. Başka hiçbir açıklama yapma.\n\nPaylaşımlar:\n" + String.join("\n", titles);
        return callGeminiWithRetry(prompt);
    }

    public String analyzeContent(String title, String content) {
        if (apiKey == null || apiKey.isEmpty()) return "";
        String prompt = String.format(
            "Aşağıdaki içeriği analiz et ve bu içeriği en iyi temsil eden 3 adet anahtar kelime (Türkçe) belirle. " +
            "Sadece kelimeleri aralarında virgül olacak şekilde döndür. Başka hiçbir açıklama yapma.\n\nBaşlık: %s\nİçerik: %s",
            title, content
        );
        return callGeminiWithRetry(prompt);
    }

    private String callGeminiWithRetry(String prompt) {
        int maxRetries = 10;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                String result = callGemini(prompt);
                Thread.sleep(1000); // Başarılı olsa bile 1 saniye dinlen
                return result;
            } catch (HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                System.out.println(">>> Gemini Limitine Takildi (429). 15 saniye bekleniyor... Deneme: " + retryCount);
                try {
                    Thread.sleep(15000); // 15 saniye bekle
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                System.err.println("Gemini API Beklenmedik Hata: " + e.getMessage());
                break;
            }
        }
        return "";
    }

    private String callGemini(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> contents = Map.of("parts", List.of(Map.of("text", prompt)));
        Map<String, Object> body = Map.of("contents", List.of(contents));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(API_URL + apiKey, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            JsonNode root = objectMapper.readTree(response.getBody());
            String result = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            return result.trim().replace("\n", "").toLowerCase();
        }
        return "";
    }
}
