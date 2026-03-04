# Chat Notification Plan

## Feature: chat-notification (채팅 알림)
**Created**: 2026-03-04
**Level**: Dynamic

---

## 1. 요구사항 요약

채팅 메시지 수신 시 **양쪽 사용자 모두**에게 알림을 제공하는 기능:

1. **게시글 작성자**: 다른 사용자로부터 채팅 메시지를 받으면 알림 수신
2. **채팅 참여자(chatter)**: 게시글 작성자로부터 답장을 받으면 알림 수신
3. **알림 표시**: 홈/채팅 화면 오른쪽 위 알림 아이콘에 빨간 뱃지 표시
4. **알림 목록**: 알림 페이지에서 실제 알림 목록 확인 가능

---

## 2. 핵심 User Story

| # | As a | I want to | So that |
|---|------|-----------|---------|
| US-1 | 게시글 작성자 | 누군가 내 게시글에 채팅을 보내면 알림을 받고 싶다 | 빠르게 대화에 응답할 수 있다 |
| US-2 | 채팅 참여자 | 작성자가 답장하면 알림을 받고 싶다 | 답장을 놓치지 않는다 |
| US-3 | 사용자 | 헤더 알림 아이콘에 읽지 않은 알림 수가 보이면 좋겠다 | 새 알림이 있는지 한눈에 알 수 있다 |
| US-4 | 사용자 | 알림을 클릭하면 해당 채팅방으로 이동하고 싶다 | 바로 대화를 이어갈 수 있다 |

---

## 3. 범위 (Scope)

### In Scope
- Notification 엔티티 (백엔드 DB 저장)
- 메시지 전송 시 수신자에게 자동 알림 생성 (백엔드)
- 알림 목록 API (GET)
- 읽지 않은 알림 개수 API (GET)
- 알림 읽음 처리 API (PATCH)
- 프론트엔드 알림 아이콘 뱃지 (읽지 않은 개수)
- NotificationsPage를 실제 API 데이터로 교체
- 알림 클릭 시 해당 채팅방으로 네비게이션

### Out of Scope
- 실시간 WebSocket/SSE 푸시 (폴링으로 대체)
- 푸시 알림 (PWA/FCM)
- 알림 설정 (on/off)
- 채팅 외 다른 종류의 알림 (결제, 수거 완료 등)

---

## 4. 기술 결정사항

| 항목 | 결정 | 이유 |
|------|------|------|
| 알림 저장 | MySQL `notifications` 테이블 | 기존 인프라 활용 |
| 실시간성 | 프론트에서 주기적 폴링 (30초) | WebSocket 없이 단순 구현 |
| 알림 생성 시점 | ChatMessageService.send() 내부 | 메시지 전송과 트랜잭션 통합 |
| 알림 카운트 | Header 컴포넌트에서 전역 상태 관리 | 모든 페이지에서 뱃지 표시 |

---

## 5. 구현 순서

### Phase 1: Backend - Notification 엔티티 및 API
1. `Notification` 엔티티 생성 (id, userId, type, title, message, link, isRead, createdAt)
2. `NotificationRepository` 생성
3. `NotificationService` 생성 (create, getByUserId, getUnreadCount, markAsRead)
4. `NotificationController` 생성 (REST API 엔드포인트)
5. `ChatMessageService.send()`에서 알림 자동 생성 로직 추가

### Phase 2: Frontend - 알림 서비스 및 전역 상태
1. `notificationService.ts` 생성 (API 클라이언트)
2. 알림 카운트 전역 상태 관리 (useNotificationStore 또는 Context)
3. Header 컴포넌트에 뱃지 카운트 표시
4. 주기적 폴링 로직 (30초 간격)

### Phase 3: Frontend - 알림 페이지 실제 데이터 연동
1. NotificationsPage를 실제 API 데이터로 교체
2. 알림 클릭 시 채팅방으로 이동 + 읽음 처리
3. 알림 읽음 시 뱃지 카운트 갱신

---

## 6. API 설계 (예상)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications?userId={id}` | 사용자 알림 목록 |
| GET | `/api/notifications/unread-count?userId={id}` | 읽지 않은 알림 개수 |
| PATCH | `/api/notifications/{id}/read` | 단일 알림 읽음 처리 |
| PATCH | `/api/notifications/read-all?userId={id}` | 전체 읽음 처리 |

---

## 7. 영향 분석

### 수정 대상 파일
- **Backend (신규)**: Notification.java, NotificationRepository.java, NotificationService.java, NotificationController.java, DTO 클래스들
- **Backend (수정)**: ChatMessageService.java (알림 생성 로직 추가)
- **Frontend (신규)**: notificationService.ts, useNotificationStore (또는 NotificationContext)
- **Frontend (수정)**: Header.tsx (뱃지 추가), NotificationsPage.tsx (실제 데이터), HomePage.tsx (뱃지)

### 리스크
- 폴링 주기가 너무 짧으면 서버 부하 → 30초 간격으로 적정 수준 유지
- 사용자 인증 없이 userId 파라미터로 조회 → 현재 프로젝트 인증 방식과 일관성 유지
