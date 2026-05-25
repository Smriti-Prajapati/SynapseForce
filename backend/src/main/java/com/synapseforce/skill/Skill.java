package com.synapseforce.skill;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.synapseforce.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String skillName;

    @Column(nullable = false)
    private int strengthLevel;

    // HR can endorse/verify a skill — adds a ✓ badge on the frontend
    @Builder.Default
    private boolean endorsed = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
