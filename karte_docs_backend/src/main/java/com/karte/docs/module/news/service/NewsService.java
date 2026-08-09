package com.karte.docs.module.news.service;


import com.karte.docs.module.news.dto.NewsRequest;
import com.karte.docs.module.news.dto.NewsResponse;
import com.karte.docs.module.news.entity.News;
import com.karte.docs.module.news.repository.NewsRepository;
import com.karte.docs.shared.exception.ResourceNotFoundException;
import com.karte.docs.shared.utils.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;
    private final SecurityUtils securityUtils;

    public List<NewsResponse> getAllActiveNews(){
        return newsRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<NewsResponse> getDeletedNews(){
        return newsRepository.findAllDeleted().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public NewsResponse createNews(NewsRequest request){
        News news = new News();

        news.setTitle(request.title());
        news.setContent(request.content());
        news.setAuthor(securityUtils.getCurrentUser());

        return mapToResponse(newsRepository.save(news));
    }

    @Transactional
    public void deleteNews(Long id){
        newsRepository.deleteById(id);
    }

    @Transactional
    public void restoreNews(Long id){
        News news = newsRepository.findByIdIncludingDeleted(id);
        if (news == null) throw new ResourceNotFoundException("News not found");
        news.setDeletedAt(null); // restore
        newsRepository.save(news);
    }

    private NewsResponse mapToResponse(News news){
        return new NewsResponse(
                news.getId(),
                news.getTitle(),
                news.getContent(),
                news.getAuthor() != null ? news.getAuthor().getFullName() : "Systems",
                news.getCreatedAt()
        );
    }

}
