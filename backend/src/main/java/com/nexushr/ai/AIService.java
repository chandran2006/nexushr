package com.nexushr.ai;

import com.nexushr.entity.Employee;
import com.nexushr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String model;

    @Value("${openai.max-tokens:1000}")
    private int maxTokens;

    private final EmployeeRepository employeeRepository;
    private final RestTemplate restTemplate;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final java.util.Random RANDOM = new java.util.Random();

    public String chat(String userMessage, String conversationContext) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return generateMockResponse(userMessage);
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", buildSystemPrompt()));
            if (conversationContext != null && !conversationContext.isBlank()) {
                messages.add(Map.of("role", "assistant", "content", conversationContext));
            }
            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", messages,
                    "max_tokens", maxTokens,
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage());
        }
        return generateMockResponse(userMessage);
    }

    public Map<String, Object> predictAttrition(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new com.nexushr.exception.ResourceNotFoundException("Employee", "id", employeeId));

        double score = calculateAttritionScore(employee);
        String risk = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
        List<String> factors = identifyRiskFactors(employee, score);
        List<String> recommendations = generateRecommendations(risk, factors);

        BigDecimal riskScore = BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP);
        employee.setAttritionRiskScore(riskScore);
        employeeRepository.save(employee);

        return Map.of(
                "employeeId", employeeId,
                "riskScore", score,
                "riskLevel", risk,
                "riskFactors", factors,
                "recommendations", recommendations,
                "analysisDate", LocalDate.now()
        );
    }

    public Map<String, Object> analyzeSkillGap(UUID employeeId, String targetRole) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new com.nexushr.exception.ResourceNotFoundException("Employee", "id", employeeId));

        String currentSkills = employee.getSkills() != null ? employee.getSkills() : "";
        List<String> requiredSkills = getRequiredSkillsForRole(targetRole);
        List<String> currentSkillList = Arrays.asList(currentSkills.split(","));
        List<String> gaps = requiredSkills.stream()
                .filter(s -> currentSkillList.stream().noneMatch(cs -> cs.trim().equalsIgnoreCase(s.trim())))
                .toList();
        List<String> matched = requiredSkills.stream()
                .filter(s -> currentSkillList.stream().anyMatch(cs -> cs.trim().equalsIgnoreCase(s.trim())))
                .toList();

        double readinessScore = requiredSkills.isEmpty() ? 100 :
                (double) matched.size() / requiredSkills.size() * 100;

        return Map.of(
                "employeeId", employeeId,
                "targetRole", targetRole,
                "currentSkills", currentSkillList,
                "requiredSkills", requiredSkills,
                "skillGaps", gaps,
                "matchedSkills", matched,
                "readinessScore", Math.round(readinessScore),
                "trainingRecommendations", generateTrainingRecommendations(gaps)
        );
    }

    public Map<String, Object> getEngagementInsights(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new com.nexushr.exception.ResourceNotFoundException("Employee", "id", employeeId));

        double score = calculateEngagementScore(employee);
        employee.setEngagementScore(BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP));
        employeeRepository.save(employee);

        return Map.of(
                "employeeId", employeeId,
                "engagementScore", score,
                "level", score >= 75 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW",
                "insights", generateEngagementInsights(score),
                "actionItems", generateActionItems(score)
        );
    }

    private double calculateAttritionScore(Employee employee) {
        double score = 0;
        if (employee.getHireDate() != null) {
            long months = ChronoUnit.MONTHS.between(employee.getHireDate(), LocalDate.now());
            if (months < 12) score += 25;
            else if (months < 24) score += 15;
        }
        if (employee.getBaseSalary() != null && employee.getBaseSalary().compareTo(BigDecimal.valueOf(50000)) < 0) {
            score += 20;
        }
        if (employee.getStatus() == Employee.EmployeeStatus.PROBATION) score += 15;
        if (employee.getAnnualLeaveBalance() == 0) score += 10;
        score += RANDOM.nextInt(20);
        return Math.min(score, 100);
    }

    private double calculateEngagementScore(Employee employee) {
        double score = 70;
        if (employee.getHireDate() != null) {
            long months = ChronoUnit.MONTHS.between(employee.getHireDate(), LocalDate.now());
            if (months > 24) score += 10;
        }
        if (employee.getAnnualLeaveBalance() > 10) score += 5;
        score += RANDOM.nextInt(15) - 5;
        return Math.min(Math.max(score, 0), 100);
    }

    private List<String> identifyRiskFactors(Employee employee, double score) {
        List<String> factors = new ArrayList<>();
        if (employee.getHireDate() != null && ChronoUnit.MONTHS.between(employee.getHireDate(), LocalDate.now()) < 12) {
            factors.add("New employee (< 1 year tenure)");
        }
        if (employee.getBaseSalary() != null && employee.getBaseSalary().compareTo(BigDecimal.valueOf(50000)) < 0) {
            factors.add("Below market compensation");
        }
        if (score > 60) factors.add("Limited career growth opportunities identified");
        if (employee.getAnnualLeaveBalance() == 0) factors.add("No remaining leave balance - potential burnout risk");
        return factors;
    }

    private List<String> generateRecommendations(String risk, List<String> factors) {
        List<String> recs = new ArrayList<>();
        if ("HIGH".equals(risk)) {
            recs.add("Schedule immediate 1:1 retention conversation");
            recs.add("Review compensation against market benchmarks");
            recs.add("Create personalized career development plan");
        } else if ("MEDIUM".equals(risk)) {
            recs.add("Conduct quarterly check-in meeting");
            recs.add("Explore growth opportunities within the organization");
        } else {
            recs.add("Continue regular engagement activities");
            recs.add("Recognize and reward performance");
        }
        return recs;
    }

    private List<String> getRequiredSkillsForRole(String role) {
        Map<String, List<String>> roleSkills = Map.of(
                "Senior Engineer", List.of("Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "AWS"),
                "Tech Lead", List.of("Java", "Architecture", "Leadership", "Agile", "System Design"),
                "HR Manager", List.of("Recruitment", "HRIS", "Labor Law", "Performance Management", "Conflict Resolution"),
                "Data Analyst", List.of("SQL", "Python", "Tableau", "Excel", "Statistics")
        );
        return roleSkills.getOrDefault(role, List.of("Communication", "Leadership", "Problem Solving"));
    }

    private List<String> generateTrainingRecommendations(List<String> gaps) {
        return gaps.stream().map(gap -> "Training course: " + gap + " Fundamentals").toList();
    }

    private List<String> generateEngagementInsights(double score) {
        if (score >= 75) return List.of("Employee shows high engagement", "Strong alignment with company values");
        if (score >= 50) return List.of("Moderate engagement level", "Some areas need attention");
        return List.of("Low engagement detected", "Immediate intervention recommended");
    }

    private List<String> generateActionItems(double score) {
        if (score >= 75) return List.of("Recognize achievements publicly", "Offer stretch assignments");
        if (score >= 50) return List.of("Schedule career development discussion", "Increase feedback frequency");
        return List.of("Urgent 1:1 meeting required", "Review workload and responsibilities", "Consider role adjustment");
    }

    private String buildSystemPrompt() {
        return "You are NexusHR AI Assistant, an intelligent HR advisor for Amdox Technologies.\n" +
               "You help HR professionals and employees with:\n" +
               "- HR policies and procedures\n" +
               "- Leave and attendance queries\n" +
               "- Performance management guidance\n" +
               "- Career development advice\n" +
               "- Payroll and benefits questions\n" +
               "- Recruitment best practices\n" +
               "- Employee relations guidance\n\n" +
               "Be professional, empathetic, concise, and helpful. Always maintain confidentiality.\n" +
               "If asked about specific employee data, remind users to use the platform's secure features.";
    }

    private String generateMockResponse(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("leave") || lower.contains("vacation")) {
            return "To apply for leave, navigate to the Leave Management section and click 'Apply Leave'. You can select the leave type, dates, and provide a reason. Your manager will be notified for approval. Your current leave balance is shown on your dashboard.";
        }
        if (lower.contains("payroll") || lower.contains("salary") || lower.contains("payslip")) {
            return "Payslips are generated monthly and available in the Payroll section. You can download PDF payslips for any month. For salary queries, please contact HR directly or raise a ticket through the system.";
        }
        if (lower.contains("performance") || lower.contains("review") || lower.contains("goal")) {
            return "Performance reviews are conducted quarterly. You can set and track your OKRs in the Performance section. Regular 1:1s with your manager are recommended to stay aligned with your goals.";
        }
        if (lower.contains("attendance") || lower.contains("clock")) {
            return "You can clock in/out using the Attendance module. The system tracks your work hours automatically. If you have any attendance discrepancies, please contact HR within 48 hours.";
        }
        if (lower.contains("policy") || lower.contains("rule")) {
            return "Company policies are available in the HR Policy section. Key policies include: Work from Home (up to 2 days/week), Leave Policy (20 annual + 10 sick days), Code of Conduct, and Anti-Harassment Policy. For specific policy questions, contact HR.";
        }
        return "I'm NexusHR AI Assistant. I can help you with HR queries, leave management, payroll information, performance reviews, and more. How can I assist you today? For urgent matters, please contact HR directly at hr@nexushr.com.";
    }
}
