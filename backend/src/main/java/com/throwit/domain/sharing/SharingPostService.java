package com.throwit.domain.sharing;

import com.throwit.domain.sharing.dto.SharingPostCreateRequest;
import com.throwit.domain.sharing.dto.SharingPostResponse;
import com.throwit.global.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SharingPostService {

    private final SharingPostRepository sharingPostRepository;
    private final ObjectMapper objectMapper;

    public List<SharingPostResponse> getMyList(Long authorId, String authorNickname) {
        return sharingPostRepository.findByAuthorIdOrAuthorNicknameOrderByCreatedAtDesc(authorId, authorNickname)
                .stream()
                .map(SharingPostResponse::from)
                .collect(Collectors.toList());
    }

    public List<SharingPostResponse> getList(String sigungu, String keyword) {
        List<SharingPost> posts;

        if (sigungu != null && !sigungu.isBlank() && keyword != null && !keyword.isBlank()) {
            posts = sharingPostRepository.findBySigunguAndTitleContainingOrderByCreatedAtDesc(sigungu, keyword);
        } else if (sigungu != null && !sigungu.isBlank()) {
            posts = sharingPostRepository.findBySigunguOrderByCreatedAtDesc(sigungu);
        } else {
            posts = sharingPostRepository.findAllByOrderByCreatedAtDesc();
        }

        return posts.stream()
                .map(SharingPostResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public SharingPostResponse getDetail(Long id) {
        SharingPost post = sharingPostRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + id));
        post.incrementViewCount();
        return SharingPostResponse.from(post);
    }

    @Transactional
    public SharingPostResponse create(SharingPostCreateRequest request) {
        String imageUrlsJson = null;
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            try {
                imageUrlsJson = objectMapper.writeValueAsString(request.getImageUrls());
            } catch (Exception e) {
                imageUrlsJson = null;
            }
        }

        SharingPost post = SharingPost.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .sido(request.getSido())
                .sigungu(request.getSigungu())
                .dong(request.getDong())
                .preferredPlace(request.getPreferredPlace())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .authorId(request.getAuthorId())
                .authorNickname(request.getAuthorNickname())
                .imageUrls(imageUrlsJson)
                .status(SharingStatus.SHARING)
                .build();

        SharingPost saved = sharingPostRepository.save(post);
        return SharingPostResponse.from(saved);
    }

    @Transactional
    public SharingPostResponse update(Long id, SharingPostCreateRequest request) {
        SharingPost post = sharingPostRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + id));

        String imageUrlsJson = null;
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            try {
                imageUrlsJson = objectMapper.writeValueAsString(request.getImageUrls());
            } catch (Exception e) {
                imageUrlsJson = null;
            }
        }

        SharingStatus newStatus = null;
        if (request.getStatus() != null) {
            switch (request.getStatus()) {
                case "나눔중" -> newStatus = SharingStatus.SHARING;
                case "예약중" -> newStatus = SharingStatus.RESERVED;
                case "나눔완료" -> newStatus = SharingStatus.COMPLETED;
            }
        }

        post.update(
                request.getTitle(),
                request.getDescription(),
                request.getCategory(),
                request.getPreferredPlace(),
                imageUrlsJson,
                newStatus
        );

        return SharingPostResponse.from(post);
    }

    @Transactional
    public void delete(Long id) {
        SharingPost post = sharingPostRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + id));
        sharingPostRepository.delete(post);
    }
}
