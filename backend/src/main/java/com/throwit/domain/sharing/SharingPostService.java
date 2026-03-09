package com.throwit.domain.sharing;

import com.throwit.domain.sharing.chat.ChatRoom;
import com.throwit.domain.sharing.chat.ChatMessageRepository;
import com.throwit.domain.sharing.chat.ChatRoomRepository;
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
    private final ScrapRepository scrapRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    public List<SharingPostResponse> getMyList(Long authorId) {
        return sharingPostRepository.findByAuthorIdOrderByCreatedAtDesc(authorId)
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
    public SharingPostResponse update(Long id, Long userId, SharingPostCreateRequest request) {
        SharingPost post = sharingPostRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + id));
        if (!post.getAuthorId().equals(userId)) {
            throw BusinessException.badRequest("NOT_AUTHOR", "게시글 작성자만 수정할 수 있습니다.");
        }

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
    public void delete(Long id, Long userId) {
        SharingPost post = sharingPostRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + id));
        if (!post.getAuthorId().equals(userId)) {
            throw BusinessException.badRequest("NOT_AUTHOR", "게시글 작성자만 삭제할 수 있습니다.");
        }

        // 관련 채팅 메시지 → 채팅방 → 스크랩 순서로 삭제
        List<ChatRoom> rooms = chatRoomRepository.findBySharingPostId(id);
        for (ChatRoom room : rooms) {
            chatMessageRepository.deleteByChatRoomId(room.getId());
        }
        chatRoomRepository.deleteAll(rooms);
        scrapRepository.deleteBySharingPost(post);

        sharingPostRepository.delete(post);
    }

    @Transactional
    public boolean toggleScrap(Long postId, String userId) {
        SharingPost post = sharingPostRepository.findById(postId)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + postId));

        var existing = scrapRepository.findByUserIdAndSharingPost(userId, post);
        if (existing.isPresent()) {
            scrapRepository.delete(existing.get());
            post.decrementScrapCount();
            return false;
        } else {
            Scrap scrap = Scrap.builder()
                    .userId(userId)
                    .sharingPost(post)
                    .build();
            scrapRepository.save(scrap);
            post.incrementScrapCount();
            return true;
        }
    }

    public boolean isScrapped(Long postId, String userId) {
        return sharingPostRepository.findById(postId)
                .map(post -> scrapRepository.existsByUserIdAndSharingPost(userId, post))
                .orElse(false);
    }

    public List<SharingPostResponse> getMyScraps(String userId) {
        return scrapRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(scrap -> SharingPostResponse.from(scrap.getSharingPost()))
                .collect(Collectors.toList());
    }

    public List<SharingPostResponse> getChattedPosts(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByChatterIdOrderByLastMessageAtDesc(userId);
        // 본인이 작성한 게시글의 채팅방 제외 (ownerId == userId인 경우)
        List<Long> postIds = rooms.stream()
                .filter(room -> !userId.equals(room.getOwnerId()))
                .map(ChatRoom::getSharingPostId)
                .distinct()
                .collect(Collectors.toList());
        if (postIds.isEmpty()) return List.of();
        return sharingPostRepository.findAllById(postIds).stream()
                .map(SharingPostResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public SharingPostResponse completeTransaction(Long postId, Long receiverId, Long ownerId) {
        SharingPost post = sharingPostRepository.findById(postId)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + postId));

        if (!ownerId.equals(post.getAuthorId())) {
            throw BusinessException.badRequest("NOT_AUTHOR", "게시글 작성자만 거래를 완료할 수 있습니다.");
        }

        post.completeTransaction(receiverId);
        return SharingPostResponse.from(post);
    }

    @Transactional
    public SharingPostResponse cancelTransaction(Long postId, Long ownerId) {
        SharingPost post = sharingPostRepository.findById(postId)
                .orElseThrow(() -> BusinessException.notFound("SHARING_NOT_FOUND", "해당 나눔 게시글을 찾을 수 없습니다: " + postId));

        if (!ownerId.equals(post.getAuthorId())) {
            throw BusinessException.badRequest("NOT_AUTHOR", "게시글 작성자만 거래를 취소할 수 있습니다.");
        }

        post.cancelTransaction();
        return SharingPostResponse.from(post);
    }

    public List<SharingPostResponse> getReceivedPosts(Long userId) {
        return sharingPostRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
                .map(SharingPostResponse::from)
                .collect(Collectors.toList());
    }
}
