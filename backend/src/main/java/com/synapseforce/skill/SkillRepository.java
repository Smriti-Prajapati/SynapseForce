package com.synapseforce.skill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByUserId(Long userId);

    // For analytics: count occurrences of each skill name
    @Query("SELECT s.skillName, COUNT(s) FROM Skill s GROUP BY s.skillName ORDER BY COUNT(s) DESC")
    List<Object[]> findSkillDistribution();

    @Transactional
    void deleteByUserId(Long userId);
}
