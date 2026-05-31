package com.synapseforce.resume;

import com.synapseforce.skill.Skill;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ResumeParserService parserService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public Resume uploadAndProcess(MultipartFile file, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Save file to disk
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Extract text via Tika
        String extractedText = parserService.extractText(file);

        // Persist resume record
        Resume resume = Resume.builder()
                .fileName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .contentType(file.getContentType())
                .extractedText(extractedText)
                .user(user)
                .build();
        resumeRepository.save(resume);

        // Extract and save skills (replace existing ones for this user)
        skillRepository.deleteByUserId(userId);
        Map<String, Integer> skills = parserService.extractSkills(extractedText);
        skills.forEach((name, strength) -> {
            Skill skill = Skill.builder()
                    .skillName(name)
                    .strengthLevel(strength)
                    .user(user)
                    .build();
            skillRepository.save(skill);
        });

        return resume;
    }

    public Resume getById(Long id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
    }

    public List<Resume> getResumesForUser(Long userId) {
        return resumeRepository.findByUserId(userId);
    }

    public List<Resume> getAllResumes() {
        return resumeRepository.findAllByOrderByUploadedAtDesc();
    }
}
