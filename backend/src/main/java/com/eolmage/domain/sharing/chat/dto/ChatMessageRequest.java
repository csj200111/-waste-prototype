package com.eolmage.domain.sharing.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatMessageRequest {

    @NotNull(message = "발신자 ID는 필수입니다")
    private Long senderId;

    @NotBlank(message = "발신자 닉네임은 필수입니다")
    private String senderNickname;

    @NotBlank(message = "메시지 내용은 필수입니다")
    private String content;
}
