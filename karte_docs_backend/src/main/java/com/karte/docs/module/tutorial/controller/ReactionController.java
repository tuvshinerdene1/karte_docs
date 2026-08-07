package com.karte.docs.module.tutorial.controller;

import com.karte.docs.module.tutorial.dto.ReactionRequest;
import com.karte.docs.module.tutorial.dto.TutorialStats;
import com.karte.docs.module.tutorial.service.ReactionService;
import com.karte.docs.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tutorials/reactions")
@RequiredArgsConstructor
public class ReactionController {
    private final ReactionService reactionService;

    // medical staff react
    @PostMapping
    public ApiResponse<Void> react (@RequestBody ReactionRequest request){
        reactionService.react(request);
        return ApiResponse.success(null, "Reaction updated");
    }

    // support staff see stats
    @GetMapping("/{tutorialId}/stats")
    public ApiResponse<TutorialStats> getStats(@PathVariable Long tutorialId){
        return ApiResponse.success(reactionService.getStats(tutorialId), "Stats fetched");
    }
}
