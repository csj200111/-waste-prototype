package com.eolmage.domain.sharing.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatRoomRequest {

    @NotNull(message = "채팅 요청자 ID는 필수입니다")
    private Long chatterId;

    @NotBlank(message = "채팅 요청자 닉네임은 필수입니다")
    private String chatterNickname;
}
