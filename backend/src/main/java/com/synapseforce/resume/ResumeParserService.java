package com.synapseforce.resume;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

/**
 * Handles text extraction from uploaded resumes (PDF, DOCX, etc.)
 * and maps extracted content to a skill set with estimated strength levels.
 */
@Service
public class ResumeParserService {

    private final Tika tika = new Tika();

    // Curated skill keyword list — extend as needed
    private static final List<String> KNOWN_SKILLS = List.of(
        "java", "python", "javascript", "typescript", "kotlin", "go", "rust", "c++", "c#", "php", "ruby",
        "spring", "spring boot", "hibernate", "jpa", "react", "angular", "vue", "nextjs", "nodejs",
        "express", "django", "flask", "fastapi", "laravel",
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "github actions",
        "git", "linux", "bash", "rest api", "graphql", "microservices", "kafka", "rabbitmq",
        "machine learning", "deep learning", "nlp", "tensorflow", "pytorch", "scikit-learn",
        "data analysis", "pandas", "numpy", "tableau", "power bi",
        "agile", "scrum", "jira", "ci/cd", "devops", "tdd", "junit"
    );

    public String extractText(MultipartFile file) throws IOException, TikaException {
        try (InputStream stream = file.getInputStream()) {
            return tika.parseToString(stream);
        }
    }

    /**
     * Scans extracted resume text for known skills.
     * Strength is estimated by how many times the skill appears (capped at 10).
     */
    public Map<String, Integer> extractSkills(String resumeText) {
        String normalized = resumeText.toLowerCase();
        Map<String, Integer> skillMap = new LinkedHashMap<>();

        for (String skill : KNOWN_SKILLS) {
            int count = countOccurrences(normalized, skill);
            if (count > 0) {
                int strength = Math.min(count * 2, 10); // scale: 1 mention = 2, max 10
                skillMap.put(capitalize(skill), Math.max(strength, 1));
            }
        }

        return skillMap;
    }

    private int countOccurrences(String text, String keyword) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(keyword, idx)) != -1) {
            count++;
            idx += keyword.length();
        }
        return count;
    }

    private String capitalize(String skill) {
        if (skill == null || skill.isEmpty()) return skill;
        String[] words = skill.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            sb.append(Character.toUpperCase(word.charAt(0)))
              .append(word.substring(1))
              .append(" ");
        }
        return sb.toString().trim();
    }
}
