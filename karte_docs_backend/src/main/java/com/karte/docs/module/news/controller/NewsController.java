package com.karte.docs.module.news.controller;


import com.karte.docs.module.news.dto.NewsRequest;
import com.karte.docs.module.news.dto.NewsResponse;
import com.karte.docs.module.news.service.NewsService;
import com.karte.docs.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {
    private final NewsService newsService;

    // for medical & support staff
    @GetMapping
    public ApiResponse<List<NewsResponse>> getAllNews(){
        return ApiResponse.success(newsService.getAllActiveNews(), "News fetched successfully");
    }

    // support team only (trash bin)
    @GetMapping("/trash")
    public ApiResponse<List<NewsResponse>> getDeletedNews(){
        return ApiResponse.success(newsService.getDeletedNews(), "Deleted news fetched");
    }

    @PostMapping
    public ApiResponse<NewsResponse> createNews(@RequestBody @Valid NewsRequest request){
        return ApiResponse.success(newsService.createNews(request), "News created");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteNews(@PathVariable Long id){
        newsService.deleteNews(id);
        return ApiResponse.success(null, "News deleted (Soft delete)");
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restoreNews(@PathVariable Long id){
        newsService.restoreNews(id);
        return ApiResponse.success(null, "News restored successfully");
    }

}
