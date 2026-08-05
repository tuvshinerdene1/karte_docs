package com.karte.docs.module.news.repository;

import com.karte.docs.module.news.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    // see list of deleted news
    @Query(value = "SELECT * FROM news WHERE deleted_at IS NOT NULL", nativeQuery = true)
    List<News> findAllDeleted();

    // needed to find a deleted item to restore it
    @Query(value = "SELECT * FROM news WHERE  id = ?", nativeQuery = true)
    News findByIdIncludingDeleted(Long id);
}
