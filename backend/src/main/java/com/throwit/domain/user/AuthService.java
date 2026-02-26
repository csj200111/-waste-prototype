package com.throwit.domain.user;

import com.throwit.domain.user.dto.LoginRequest;
import com.throwit.domain.user.dto.SignupRequest;
import com.throwit.domain.user.dto.UserResponse;
import com.throwit.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;

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
}
