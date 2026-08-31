package com.karte.docs.module.tutorial.controller;

import com.karte.docs.module.tutorial.dto.TutorialResponse;
import com.karte.docs.module.tutorial.dto.TutorialRequest;
import com.karte.docs.module.tutorial.dto.TutorialVersionResponse;
import com.karte.docs.module.tutorial.entity.TargetAudience;
import com.karte.docs.module.tutorial.service.TutorialService;
import com.karte.docs.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/tutorials")
@RequiredArgsConstructor
public class TutorialController {
    private final TutorialService tutorialService;

    // ---- Support team endpoints
    //creating new tutorial
    @PostMapping
    public ApiResponse<TutorialResponse> create(@RequestBody @Valid TutorialRequest request){
        return ApiResponse.success(tutorialService.create(request), "Tutorial created successfully");
    }

    //update existing tutorial (create new version/ changelog)
    @PutMapping("/{id}")
    public ApiResponse<TutorialResponse> update (@PathVariable Long id, @RequestBody @Valid TutorialRequest request){
        return ApiResponse.success(tutorialService.update(id, request), "Tutorial updated to version "+ id);
    }

    // soft delete a tutorial
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete (@PathVariable Long id){
        tutorialService.deleteTutorial(id);
        return ApiResponse.success(null, "tutorial moved to trash");
    }

    // view list of deleted tutorials (trash bin)
    @GetMapping("/trash")
    public ApiResponse<List<TutorialResponse>>  getTrash(){
        return ApiResponse.success(tutorialService.getDeletedTutorials(), "Trash bin fetched");
    }

    // restore a deleted tutorial
    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore (@PathVariable Long id){
        tutorialService.restoreTutorial(id);
        return ApiResponse.success(null, "Tutorial restored successfully");
    }

    // ----SHARED / MEDICAL STAFF ENDPOINTS ---
    // get all tutorials by audience (MEDICAL OR SUPPORT)
    // usage: /api/v1/tutorials?audience=MEDICAL
    @GetMapping
    public ApiResponse<List<TutorialResponse>> getAll(@RequestParam(defaultValue = "MEDICAL") String audience){
        TargetAudience target = TargetAudience.valueOf(audience.toUpperCase());
        return ApiResponse.success(tutorialService.getAll(target), "Tutorials fetched for audience: "+ target);
    }
    // read a specific tutorial
    @GetMapping("/{id}")
    public ApiResponse<TutorialResponse> getById(@PathVariable Long id){
        return ApiResponse.success(tutorialService.getById(id), "Tutorial details fetched");
    }

    // keyword search
    // usage: /api/v1/tutorials/search?q=keywords

    @GetMapping("/search")
    public ApiResponse<List<TutorialResponse>> search (@RequestParam("q") String query){
        return ApiResponse.success(tutorialService.search(query), "Search results for : " + query);
    }

    // Add this endpoint
    @GetMapping("/{id}/versions")
    public ApiResponse<List<TutorialVersionResponse>> getVersions(@PathVariable Long id) {
        return ApiResponse.success(tutorialService.getVersionsByTutorialId(id), "History fetched");
    }
}
