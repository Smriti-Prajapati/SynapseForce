package com.synapseforce.team;

import com.synapseforce.skill.Skill;
import com.synapseforce.skill.SkillRepository;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamSuggestionService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    /**
     * Given a comma-separated list of required skills, score each user
     * based on how many required skills they have and their strength levels.
     */
    public TeamSuggestionResult suggest(String requiredSkillsInput) {
        List<String> required = parseSkills(requiredSkillsInput);

        List<User> allUsers = userRepository.findAll();
        List<ScoredUser> scored = new ArrayList<>();

        for (User user : allUsers) {
            List<Skill> userSkills = skillRepository.findByUserId(user.getId());
            double score = calculateScore(userSkills, required);

            if (score > 0) {
                List<String> matchedSkills = getMatchedSkills(userSkills, required);
                scored.add(new ScoredUser(user, score, matchedSkills));
            }
        }

        // Sort descending by score
        scored.sort(Comparator.comparingDouble(ScoredUser::score).reversed());

        List<ScoredUser> bestTeam = scored.stream().limit(3).toList();
        List<ScoredUser> optionalMembers = scored.stream().skip(3).toList();

        return new TeamSuggestionResult(bestTeam, optionalMembers, required);
    }

    private double calculateScore(List<Skill> userSkills, List<String> required) {
        double total = 0;
        for (String req : required) {
            for (Skill skill : userSkills) {
                if (skill.getSkillName().equalsIgnoreCase(req)) {
                    // Normalize strength to 0–1 range and add to score
                    total += skill.getStrengthLevel() / 10.0;
                }
            }
        }
        return total;
    }

    private List<String> getMatchedSkills(List<Skill> userSkills, List<String> required) {
        return userSkills.stream()
                .filter(s -> required.stream().anyMatch(r -> r.equalsIgnoreCase(s.getSkillName())))
                .map(Skill::getSkillName)
                .collect(Collectors.toList());
    }

    private List<String> parseSkills(String input) {
        return Arrays.stream(input.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
