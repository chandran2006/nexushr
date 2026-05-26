package com.nexushr.controller;

import com.nexushr.ai.AIService;
import com.nexushr.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Intelligence", description = "AI-powered HR features")
public class AIController {

    private final AIService aiService;

    @Data
    static class ChatRequest {
        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message too long")
        private String message;
        private String context;
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with HR AI assistant")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(@Valid @RequestBody ChatRequest req) {
        String response = aiService.chat(req.getMessage(), req.getContext());
        return ResponseEntity.ok(ApiResponse.success(Map.of("response", response)));
    }

    @GetMapping("/attrition/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER','EXECUTIVE')")
    @Operation(summary = "Predict employee attrition risk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> attrition(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.predictAttrition(employeeId)));
    }

    @GetMapping("/skill-gap/{employeeId}")
    @Operation(summary = "Analyze skill gap for target role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> skillGap(
            @PathVariable UUID employeeId,
            @RequestParam @NotBlank String targetRole) {
        return ResponseEntity.ok(ApiResponse.success(aiService.analyzeSkillGap(employeeId, targetRole)));
    }

    @GetMapping("/engagement/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','HR_MANAGER')")
    @Operation(summary = "Get employee engagement insights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> engagement(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.success(aiService.getEngagementInsights(employeeId)));
    }
}
