package com.karte.docs.module.question.service;

import com.karte.docs.module.question.dto.*;
import com.karte.docs.module.question.entity.*;
import com.karte.docs.module.question.repository.*;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    // TODO mail sender here
    // private final JavaMailSender mailSender

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request){
        Question q = new Question();
        q.setTitle(request.title());
        q.setContent(request.content());
        q.setStatus(QuestionStatus.WAITING);
        // author will be set from SecurityContext later
        return mapToResponse(questionRepository.save(q));
    }

    @Transactional
    public QuestionResponse answerQuestion(Long questionId, AnswerRequest request){
        Question q = questionRepository.findById(questionId).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        Answer a = new Answer();
        a.setContent(request.content());
        a.setQuestion(q);
        answerRepository.save(a);

        q.setStatus(QuestionStatus.ANSWERED);
        q.setPublic(request.makePublic());
        if (request.makePublic()){
            q.setStatus(QuestionStatus.PUBLISHED);
        }

        // TODO send email notification here
        System.out.println("Triggering email to : " + (q.getAuthor() != null ? q.getAuthor().getEmail() : "user"));
        return mapToResponse(questionRepository.save(q));
    }

    @Transactional
    public void togglePublic(Long id, boolean isPublic){
        Question q = questionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        q.setPublic(isPublic);
        q.setStatus(isPublic ? QuestionStatus.PUBLISHED : QuestionStatus.ANSWERED);
        questionRepository.save(q);
    }

    @Transactional
    public void deleteQuestion(Long id){
        questionRepository.deleteById(id);
    }

    @Transactional
    public List<QuestionResponse> getDeletedQuestions(){
        return questionRepository.findAllDeleted().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void restoreQuestion(Long id){
        Question q = questionRepository.findByIdIncludingDeleted(id).orElseThrow(() -> new ResourceNotFoundException("Deleted question not found"));
        q.setDeletedAt(null);
        questionRepository.save(q);
    }

    public List<QuestionResponse> getPublicQuestions(){
        return questionRepository.findByIsPublicTrue().stream().map(this::mapToResponse).toList();
    }

    // support can see everything
    public List<QuestionResponse> getAllQuestions(){
        return questionRepository.findAll().stream().map(this::mapToResponse).toList();
    }


    private QuestionResponse mapToResponse(Question question){
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getContent(),
                question.getStatus().name(),
                question.getAuthor() != null ? question.getAuthor().getFullName() : "Anonymous",
                question.getAnswer() != null ? question.getAnswer().getContent() : null,
                (question.getAnswer() != null && question.getAnswer().getResponder() != null) ? question.getAnswer().getResponder().getFullName() : "Support",
                question.isPublic(),
                question.getCreatedAt()
        );
    }
}
