package com.throwit.domain.user;

import com.throwit.domain.sharing.ScrapRepository;
import com.throwit.domain.sharing.SharingPost;
import com.throwit.domain.sharing.SharingPostRepository;
import com.throwit.domain.sharing.chat.ChatMessageRepository;
import com.throwit.domain.sharing.chat.ChatRoom;
import com.throwit.domain.sharing.chat.ChatRoomRepository;
import com.throwit.domain.user.dto.LoginRequest;
import com.throwit.domain.user.dto.ProfileUpdateRequest;
import com.throwit.domain.user.dto.SignupRequest;
import com.throwit.domain.user.dto.UserResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final SharingPostRepository sharingPostRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ScrapRepository scrapRepository;

    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw BusinessException.conflict("EMAIL_DUPLICATE", "이미 사용 중인 이메일입니다");
        }

        String salt = User.generateSalt();
        String hashedPassword = User.hashPassword(request.getPassword(), salt);

        User user = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .salt(salt)
                .nickname(request.getNickname())
                .build();

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> BusinessException.badRequest("LOGIN_FAILED", "이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!user.checkPassword(request.getPassword())) {
            throw BusinessException.badRequest("LOGIN_FAILED", "이메일 또는 비밀번호가 올바르지 않습니다");
        }

        return UserResponse.from(user);
    }

    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "사용자를 찾을 수 없습니다"));
        return UserResponse.from(user);
    }

    public boolean checkNicknameAvailable(String nickname) {
        return !userRepository.existsByNickname(nickname);
    }

    @Transactional
    public UserResponse updateProfile(Long id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "사용자를 찾을 수 없습니다"));

        String oldNickname = user.getNickname();
        user.updateProfile(request.getNickname(), request.getPhone());

        // 닉네임이 변경된 경우 관련 데이터 일괄 업데이트
        if (request.getNickname() != null && !request.getNickname().equals(oldNickname)) {
            sharingPostRepository.updateAuthorNicknameByAuthorId(id, request.getNickname());
            chatRoomRepository.updateOwnerNicknameByOwnerId(id, request.getNickname());
            chatRoomRepository.updateChatterNicknameByChatterId(id, request.getNickname());
        }

        return UserResponse.from(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("USER_NOT_FOUND", "사용자를 찾을 수 없습니다"));

        // 1. 사용자가 작성한 게시글 및 관련 데이터 삭제
        List<SharingPost> myPosts = sharingPostRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
        for (SharingPost post : myPosts) {
            List<ChatRoom> rooms = chatRoomRepository.findBySharingPostId(post.getId());
            for (ChatRoom room : rooms) {
                chatMessageRepository.deleteByChatRoomId(room.getId());
            }
            chatRoomRepository.deleteAll(rooms);
            scrapRepository.deleteBySharingPost(post);
            sharingPostRepository.delete(post);
        }

        // 2. 사용자가 다른 게시글에서 채팅한 채팅방/메시지 삭제
        List<ChatRoom> chattedRooms = chatRoomRepository.findByChatterIdOrderByLastMessageAtDesc(userId);
        for (ChatRoom room : chattedRooms) {
            chatMessageRepository.deleteByChatRoomId(room.getId());
        }
        chatRoomRepository.deleteAll(chattedRooms);

        // 3. 사용자가 스크랩한 항목 삭제
        scrapRepository.deleteByUserId(String.valueOf(userId));

        // 4. 사용자 삭제
        userRepository.delete(user);
    }
}
