package com.synapseforce.activity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who did it
    private String actorName;

    // What happened
    @Column(columnDefinition = "TEXT")
    private String action;

    // Category: PROJECT, RESUME, TASK, USER
    private String category;

    private LocalDateTime occurredAt;

    @PrePersist
    public void prePersist() { occurredAt = LocalDateTime.now(); }
}
