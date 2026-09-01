package com.karte.docs.module.tutorial.service;

import com.karte.docs.module.audit.service.AuditService;
import com.karte.docs.module.tutorial.dto.*;
import com.karte.docs.module.tutorial.entity.*;
import com.karte.docs.module.tutorial.repository.*;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import com.karte.docs.shared.utils.SecurityUtils;
import com.karte.docs.module.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TutorialService {
    private final TutorialRepository tutorialRepository;
    private final TutorialVersionRepository versionRepository;
    private final SecurityUtils securityUtils;
    private final ReactionRepository reactionRepository;
    private final BookmarkRepository bookmarkRepository;
    private final AuditService auditService;



    @Transactional(readOnly = true)
    public TutorialResponse getById(Long id){
        Tutorial tutorial = tutorialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tutorial not found"));
        return mapToResponse(tutorial);
    }

    // used by other services to get the raw entity
    public Tutorial getEntityById(Long id){
        return tutorialRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Tutorial not found with id:" + id));
    }

    @Transactional(readOnly = true)
    public List<TutorialResponse> search(String keyword){
        return tutorialRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TutorialResponse create(TutorialRequest request){
        Tutorial tutorial = new Tutorial();
        tutorial.setTitle(request.title());
        tutorial.setTargetAudience(TargetAudience.valueOf(request.targetAudience().toUpperCase()));
        tutorial.setCurrentVersionNumber(1);
        tutorial.setCreatedBy(securityUtils.getCurrentUser());
        Tutorial saved = tutorialRepository.save(tutorial);

        saveVersion(saved, request.content(), "Initial Release");
        return mapToResponse(saved);
    }

    @Transactional
    public TutorialResponse update(Long id, TutorialRequest request){
        Tutorial tutorial = tutorialRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tutorial not found"));

        tutorial.setTitle(request.title());
        tutorial.setTargetAudience(TargetAudience.valueOf(request.targetAudience().toUpperCase()));
        tutorial.setCurrentVersionNumber(tutorial.getCurrentVersionNumber() + 1);

        saveVersion(tutorial, request.content(), request.changelog());
        return mapToResponse(tutorialRepository.save(tutorial));
    }

    @Transactional
    public void deleteTutorial(Long id){
//        if (!tutorialRepository.existsById(id)){
//            throw new ResourceNotFoundException("Tutorial not found");
//        }
//        tutorialRepository.deleteById(id);
//        auditService.log("DELETE", "TUTORIAL", id, "Deleted tutorial with id : " + id, securityUtils.getCurrentUser());
        Tutorial t = tutorialRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Not found"));
        tutorialRepository.deleteById(id);

        auditService.log("DELETE", "TUTORIAL", id, "Moved tutorial to trash: " + t.getTitle(), securityUtils.getCurrentUser());

    }

    @Transactional(readOnly = true)
    public List<TutorialResponse> getDeletedTutorials(){
        return tutorialRepository.findAllDeleted().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public void restoreTutorial(Long id){
        Tutorial tutorial = tutorialRepository.findAllDeleted().stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Deleted tutorial not found"));
        tutorial.setDeletedAt(null);
        tutorialRepository.save(tutorial);
        auditService.log("RESTORE", "TUTORIAL", id, "Restored tutorial with id : " + id, securityUtils.getCurrentUser());
    }
    // get tutorials by audience (medical vs support)
    @Transactional(readOnly = true)
    public List<TutorialResponse> getAll(TargetAudience audience){
        return tutorialRepository.findByTargetAudience(audience).stream().map(this::mapToResponse).toList();
    }



    private void saveVersion(Tutorial tutorial, String content, String changeLog){
        TutorialVersion version = new TutorialVersion();

        version.setTutorial(tutorial);
        version.setContent(content);
        version.setVersionNumber(tutorial.getCurrentVersionNumber());
        version.setChangelog(changeLog);
        version.setAuthor(securityUtils.getCurrentUser());

        versionRepository.save(version);
    }

    public TutorialResponse mapToResponse(Tutorial t){
        // find latest version content
        TutorialVersion latest = t.getVersions().stream()
                .filter(v -> v.getVersionNumber() == t.getCurrentVersionNumber())
                .findFirst()
                .orElse(null);

        long likes = reactionRepository.countByTutorialIdAndType(t.getId(), ReactionType.LIKE);
        long dislikes = reactionRepository.countByTutorialIdAndType(t.getId(), ReactionType.DISLIKE);

        boolean bookmarked = false;
        User currentUser = securityUtils.getCurrentUser();
        if(currentUser != null){
            bookmarked = bookmarkRepository.findByUserIdAndTutorialId(currentUser.getId(), t.getId()).isPresent();
        }

        return new TutorialResponse(
                t.getId(),
                t.getTitle(),
                latest != null ? latest.getContent() : "",
                t.getTargetAudience().name(),
                t.getCurrentVersionNumber(),
                latest != null ? latest.getChangelog(): "",
                latest != null && latest.getAuthor() != null ? latest.getAuthor().getFullName() : "System",
                likes,
                dislikes,
                bookmarked,
                t.getUpdatedAt()
        );
    }

    // Add this method
    public List<TutorialVersionResponse> getVersionsByTutorialId(Long tutorialId) {
        // Ensure the tutorial exists
        if (!tutorialRepository.existsById(tutorialId)) {
            throw new ResourceNotFoundException("Tutorial not found");
        }

        return versionRepository.findByTutorialIdOrderByVersionNumberDesc(tutorialId)
                .stream()
                .map(v -> new TutorialVersionResponse(
                        v.getId(),
                        v.getVersionNumber(),
                        v.getChangelog() != null ? v.getChangelog() : "No notes provided",
                        v.getAuthor() != null ? v.getAuthor().getFullName() : "System",
                        v.getCreatedAt()
                ))
                .toList();
    }
}
