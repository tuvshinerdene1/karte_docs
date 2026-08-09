package com.karte.docs.module.tutorial.service;

import com.karte.docs.module.auth.entity.User;
import com.karte.docs.module.tutorial.dto.TutorialResponse;
import com.karte.docs.module.tutorial.entity.BookMark;
import com.karte.docs.module.tutorial.entity.Tutorial;
import com.karte.docs.module.tutorial.repository.BookmarkRepository;
import com.karte.docs.shared.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookMarkService {
    private final BookmarkRepository bookmarkRepository;
    private final TutorialService tutorialService;
    private final SecurityUtils securityUtils;

    @Transactional
    public void toggleBookmark(Long tutorialId){
        User currentUser = securityUtils.getCurrentUser();
        Optional<BookMark> existing = bookmarkRepository.findByUserIdAndTutorialId(currentUser.getId(), tutorialId);

        if (existing.isPresent()){
            bookmarkRepository.delete(existing.get());
        }
        else{
            Tutorial tutorial = tutorialService.getEntityById(tutorialId);
            bookmarkRepository.save(new BookMark(currentUser, tutorial));
        }
    }

    @Transactional
    public List<TutorialResponse> getMyBookmarks(){
        User currentUser = securityUtils.getCurrentUser();
        return bookmarkRepository.findByUserId(currentUser.getId()).stream()
                .map(bookmark -> tutorialService.mapToResponse(bookmark.getTutorial()))
                .toList();
    }

}
