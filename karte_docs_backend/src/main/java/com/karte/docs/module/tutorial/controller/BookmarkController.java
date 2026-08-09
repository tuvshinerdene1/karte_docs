package com.karte.docs.module.tutorial.controller;

import com.karte.docs.module.tutorial.dto.TutorialResponse;
import com.karte.docs.module.tutorial.entity.Tutorial;
import com.karte.docs.module.tutorial.service.BookMarkService;
import com.karte.docs.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tutorials/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {
    private final BookMarkService bookMarkService;

    @PostMapping("/{tutorialId}")
    public ApiResponse<Void> toggle(@PathVariable Long tutorialId){
        bookMarkService.toggleBookmark(tutorialId);
        return ApiResponse.success(null, "Bookmark status updated");
    }

    @GetMapping
    public ApiResponse<List<TutorialResponse>> getMyBookmarks(){
        return ApiResponse.success(bookMarkService.getMyBookmarks(), "Bookmarks fetched successfully");
    }
}
