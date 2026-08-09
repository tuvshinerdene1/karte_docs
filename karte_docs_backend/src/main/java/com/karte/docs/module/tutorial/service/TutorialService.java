package com.karte.docs.module.tutorial.service;

import com.karte.docs.module.tutorial.dto.*;
import com.karte.docs.module.tutorial.entity.*;
import com.karte.docs.module.tutorial.repository.*;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import com.karte.docs.shared.utils.SecurityUtils;
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
        if (!tutorialRepository.existsById(id)){
            throw new ResourceNotFoundException("Tutorial not found");
        }
        tutorialRepository.deleteById(id);
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

        return new TutorialResponse(
                t.getId(),
                t.getTitle(),
                latest != null ? latest.getContent() : "",
                t.getTargetAudience().name(),
                t.getCurrentVersionNumber(),
                latest != null ? latest.getChangelog(): "",
                latest != null && latest.getAuthor() != null ? latest.getAuthor().getFullName() : "System",
                t.getUpdatedAt()
        );
    }
}
