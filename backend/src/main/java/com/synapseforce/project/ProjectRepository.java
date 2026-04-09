package com.synapseforce.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByCreatedAtDesc();

    // Find projects a specific user is assigned to
    @Query("SELECT p FROM Project p JOIN p.teamMembers m WHERE m.id = :userId")
    List<Project> findByTeamMemberId(Long userId);
}
