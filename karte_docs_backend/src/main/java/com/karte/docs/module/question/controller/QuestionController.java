package com.karte.docs.module.question.controller;

import com.karte.docs.module.question.dto.*;
import com.karte.docs.module.question.service.QuestionService;
import com.karte.docs.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;
    // --- Medical staff endpoints ---
    // leave a question
    @PostMapping
    public ApiResponse<QuestionResponse> askQuestion(@RequestBody @Valid QuestionRequest request){
        return ApiResponse.success(questionService.createQuestion(request), "Question submitted successfully");
    }

    // view public Q&A (FAQ)
    @GetMapping("/public")
    public ApiResponse<List<QuestionResponse>> getPublicQuestions(){
        return ApiResponse.success(questionService.getPublicQuestions(), "Public FAQ fetched");
    }

    // --- SUPPORT TEAM ENDPOINTS ---
    // see all user questions
    @GetMapping
    public ApiResponse<List<QuestionResponse>> getAllQuestions(){
        return ApiResponse.success(questionService.getAllQuestions(), "All questions fetched");
    }

    // answer a question and change status
    @PostMapping("/{id}/answer")
    public ApiResponse<QuestionResponse> answerQuestion(
            @PathVariable Long id,
            @RequestBody @Valid AnswerRequest request
    ){
        return ApiResponse.success(questionService.answerQuestion(id, request), "Answer submitted");
    }

    // promote a question to public status
    @PutMapping("/{id}/publish")
    public ApiResponse<Void> togglePublic(@PathVariable Long id, @RequestParam boolean isPublic){
        questionService.togglePublic(id, isPublic);
        return ApiResponse.success(null , "Visibility updated");
    }

    // soft delete
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id){
        questionService.deleteQuestion(id);
        return ApiResponse.success(null, "Question deleted");
    }

    // trash bin
    @GetMapping("/trash")
    public ApiResponse<List<QuestionResponse>> getDeleted(){
        return ApiResponse.success(questionService.getDeletedQuestions(), "Deleted questions fetched");
    }

    // restoring deleted question
    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id){
        questionService.restoreQuestion(id);
        return ApiResponse.success(null, "Question restored");
    }

}
