package com.karte.docs.module.question.service;

import com.karte.docs.module.audit.service.AuditService;
import com.karte.docs.module.question.dto.*;
import com.karte.docs.module.question.entity.*;
import com.karte.docs.module.question.repository.*;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import com.karte.docs.shared.service.EmailService;
import com.karte.docs.shared.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final SecurityUtils securityUtils;
    private final EmailService emailService;
    private final AuditService auditService;

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request){
        Question q = new Question();

        q.setTitle(request.title());
        q.setContent(request.content());
        q.setStatus(QuestionStatus.WAITING);
        q.setAuthor(securityUtils.getCurrentUser());

        return mapToResponse(questionRepository.save(q));
    }

    @Transactional
    public QuestionResponse answerQuestion(Long questionId, AnswerRequest request){
        Question q = questionRepository.findById(questionId).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        Answer a = new Answer();
        a.setContent(request.content());
        a.setQuestion(q);
        a.setResponder(securityUtils.getCurrentUser());
        answerRepository.save(a);

        q.setStatus(QuestionStatus.ANSWERED);
        q.setPublic(request.makePublic());
        if (request.makePublic()){
            q.setStatus(QuestionStatus.PUBLISHED);
        }


        System.out.println("Triggering email to : " + (q.getAuthor() != null ? q.getAuthor().getEmail() : "user"));
        if (q.getAuthor() != null && q.getAuthor().getEmail() != null) {
            String subject = "Your question has been answered!";
            String body = "Hello " + q.getAuthor().getFullName() + ",\n\n" +
                    "Your question: \"" + q.getTitle() + "\" has received a new answer.\n\n" +
                    "Answer:\n" + request.content() + "\n\n" +
                    "View it here: [Next.js Link]";

            emailService.sendSimpleEmail(q.getAuthor().getEmail(), subject, body);
        }
        auditService.log("ANSWER", "QUESTION", questionId, "Provided answer to user ticket: "+questionId, securityUtils.getCurrentUser());

        return mapToResponse(questionRepository.save(q));
    }

    @Transactional
    public void togglePublic(Long id, boolean isPublic){
        Question q = questionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        q.setPublic(isPublic);
        q.setStatus(isPublic ? QuestionStatus.PUBLISHED : QuestionStatus.ANSWERED);
        questionRepository.save(q);
        auditService.log("TOGGLE", "QUESTION", id, "Toggled question public: "+id, securityUtils.getCurrentUser());

    }

    @Transactional
    public void deleteQuestion(Long id){

        questionRepository.deleteById(id);
        auditService.log("DELETE", "QUESTION", id, "Deleted  question with id: "+id, securityUtils.getCurrentUser());

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
        auditService.log("RESTORE", "QUESTION", id, "Restored question with id: "+id, securityUtils.getCurrentUser());

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
