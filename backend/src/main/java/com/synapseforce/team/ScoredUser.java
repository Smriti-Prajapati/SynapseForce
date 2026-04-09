package com.synapseforce.team;

import com.synapseforce.user.User;

import java.util.List;

public record ScoredUser(User user, double score, List<String> matchedSkills) {

    public Long userId() { return user.getId(); }
    public String fullName() { return user.getFullName(); }
    public String email() { return user.getEmail(); }
}
