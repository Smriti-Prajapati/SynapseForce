package com.synapseforce.activity;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> recent() {
        List<Map<String, Object>> logs = activityLogRepository
                .findTop20ByOrderByOccurredAtDesc()
                .stream()
                .map(a -> Map.<String, Object>of(
                    "id", a.getId(),
                    "actorName", a.getActorName(),
                    "action", a.getAction(),
                    "category", a.getCategory(),
                    "occurredAt", a.getOccurredAt().toString()
                ))
                .toList();
        return ResponseEntity.ok(logs);
    }
}
