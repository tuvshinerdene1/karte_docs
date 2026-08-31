package com.karte.docs.module.comment.service;

import com.karte.docs.module.comment.dto.*;
import com.karte.docs.module.comment.entity.Comment;
import com.karte.docs.module.comment.repository.CommentRepository;
import com.karte.docs.module.tutorial.entity.Tutorial;
import com.karte.docs.module.tutorial.service.TutorialService;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import com.karte.docs.shared.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final TutorialService tutorialService;
    private final SecurityUtils securityUtils;

    @Transactional
    public CommentResponse addComment(CommentRequest request){
        Tutorial tutorial = tutorialService.getEntityById(request.tutorialId());

        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setTutorial(tutorial);
        comment.setAuthor(securityUtils.getCurrentUser());

        if (request.parentId() != null){
            Comment parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            comment.setParent(parent);
        }

        return mapToResponse(commentRepository.save(comment));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTutorial(Long tutorialId) {
        // FIX: Only fetch Root comments. The replies will be nested inside them
        // because of the recursive mapToResponse we built.
        return commentRepository.findByTutorialIdAndParentIsNullOrderByCreatedAtDesc(tutorialId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteComment(Long id){
        commentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getDeletedComments(){
        return commentRepository.findAllDeleted().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void restoreComment(Long id){
        Comment comment = commentRepository.findByIdIncludingDeleted(id).orElseThrow(() -> new ResourceNotFoundException("Deleted comment not found"));
        comment.setDeletedAt(null);
        commentRepository.save(comment);
    }


    public CommentResponse mapToResponse(Comment c) {
        List<CommentResponse> replyDtos = (c.getReplies() != null)
                ? c.getReplies().stream().map(this::mapToResponse).toList()
                : new ArrayList<>();

        return new CommentResponse(
                c.getId(),
                c.getContent(),
                c.getAuthor() != null ? c.getAuthor().getFullName() : "Anonymous",
                c.getTutorial().getId(),
                c.getCreatedAt(),
                c.getParent() != null ? c.getParent().getId() : null,
                replyDtos // The mapped list of replies
        );
    }

}
