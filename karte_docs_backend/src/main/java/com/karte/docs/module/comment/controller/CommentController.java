package com.karte.docs.module.comment.controller;

import com.karte.docs.module.comment.dto.*;
import com.karte.docs.module.comment.service.CommentService;
import com.karte.docs.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    // leave a comment
    @PostMapping
    public ApiResponse<CommentResponse> addComment(@RequestBody @Valid CommentRequest request){
        return ApiResponse.success(commentService.addComment(request), "Comment posted");
    }

    // view comments for tutorial
    @GetMapping("/tutorial/{tutorialId}")
    public ApiResponse<List<CommentResponse>> getByTutorial(@PathVariable Long tutorialId){
        return ApiResponse.success(commentService.getCommentsByTutorial(tutorialId), "Comments fetched");
    }

    // support team delete comment
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id){
        commentService.deleteComment(id);
        return ApiResponse.success(null, "Comment deleted (soft delete)");
    }

    // support trash bin
    @GetMapping("/trash")
    public ApiResponse<List<CommentResponse>> getTrash(){
        return ApiResponse.success(commentService.getDeletedComments(), "Deleted comments fetched");
    }

    // undo deletion
    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore (@PathVariable Long id){
        commentService.restoreComment(id);
        return ApiResponse.success(null, "Comment restored");
    }
}
