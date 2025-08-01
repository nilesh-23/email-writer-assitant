package com.email.writer.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.Objects;

@Service
public class EmailGeneratorService {

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    private final WebClient webClient;

    public EmailGeneratorService(WebClient.Builder webClientBuilder)
    {
        this.webClient = webClientBuilder.build();
        System.out.println("Gemini API URL: " + geminiApiUrl);
        System.out.println("Gemini API Key: " + geminiApiKey );

    }

    public String generateEmailReply(EmailRequest emailRequest)
    {
        //Build Prompt
        String prompt = buildPrompt(emailRequest);

        // Create a request according to API
        Map<String, Object> requestBody = Map.of(
                "contents" , new Object[]{
                        Map.of("parts", new Object[]{
                            Map.of("text", prompt)
                })
                });

        // Request and get response
        String response = webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // Extract response content and return
        return extractResponseContent(response);

    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }
        catch (Exception e) {
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create a professional reply for the following email.  Only output the revised email content with no explanations or intro text. Do not include a subject line");
        prompt.append(emailRequest.getEmailContent());

        if(emailRequest.getTone()!=null && !emailRequest.getTone().isEmpty())
        {
            prompt.append("Use a").append(emailRequest.getTone()).append("tone");
        }

        return prompt.toString();
    }
}
