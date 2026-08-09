package com.karte.docs.module.tutorial.repository;

import com.karte.docs.module.tutorial.entity.BookMark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<BookMark, Long> {
    // get all bookmarks for a specific uesr
    List<BookMark> findByUserId(Long userId);

    // check if a bookmark already exists
    Optional<BookMark> findByUserIdAndTutorialId(Long userId, Long tutorialId);

    // remove a bookmark
    void deleteByUserIdAndTutorialId(Long userId, Long tutorialId);
}
