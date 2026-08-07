package com.karte.docs.module.tutorial.service;

import com.karte.docs.module.tutorial.dto.ReactionRequest;
import com.karte.docs.module.tutorial.dto.TutorialStats;
import com.karte.docs.module.tutorial.entity.Reaction;
import com.karte.docs.module.tutorial.entity.ReactionType;
import com.karte.docs.module.tutorial.entity.Tutorial;
import com.karte.docs.module.tutorial.repository.ReactionRepository;
import com.karte.docs.module.tutorial.repository.TutorialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final ReactionRepository reactionRepository;
    private final TutorialService tutorialService;
    private final TutorialRepository tutorialRepository;

    @Transactional
    public void react(ReactionRequest request){
        ReactionType newType = ReactionType.valueOf(request.type().toUpperCase());
        Tutorial tutorial = tutorialService.getEntityById(request.tutorialId());
        // TODO: get real user id from securityContext
        Long userId = 1L;

        Optional<Reaction> existing = reactionRepository.findByUserIdAndTutorialId(userId, tutorial.getId());

        if (existing.isPresent()){
            Reaction reaction = existing.get();
            if (reaction.getType() == newType){
                // toggle off : if same type, remove it
                reactionRepository.delete(reaction);
            }
            else{
                // switch: if different type, update it
                reaction.setType(newType);
                reactionRepository.save(reaction);
            }
        }
        else{
            // new reaction
            Reaction reaction = new Reaction();
            reaction.setType(newType);
            reaction.setTutorial(tutorial);
            reactionRepository.save(reaction);
        }
    }

    public TutorialStats getStats(Long tutorialId){
        Tutorial tutorial = tutorialService.getEntityById(tutorialId);
        long likes = reactionRepository.countByTutorialIdAndType(tutorialId, ReactionType.LIKE);
        long dislikes = reactionRepository.countByTutorialIdAndType(tutorialId, ReactionType.DISLIKE);

        return new TutorialStats(tutorialId, tutorial.getTitle(), likes, dislikes);
    }
}
