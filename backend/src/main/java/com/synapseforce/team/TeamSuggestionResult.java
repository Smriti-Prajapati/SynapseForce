package com.synapseforce.team;

import java.util.List;

public record TeamSuggestionResult(
    List<ScoredUser> bestTeam,
    List<ScoredUser> optionalMembers,
    List<String> requiredSkills
) {}
