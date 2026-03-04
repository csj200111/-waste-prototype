# Chat Notification Design

## Feature: chat-notification (채팅 알림)
**Created**: 2026-03-04
**Plan Reference**: `docs/01-plan/features/chat-notification.plan.md`

---

## 1. 데이터 모델

### 1.1 Notification 엔티티

```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;           // 알림 수신자 ID

    @Column(nullable = false, length = 20)
    private String type;           // "CHAT" (향후 확장 가능)

    @Column(nullable = false)
    private String title;          // 예: "새로운 채팅"

    @Column(nullable = false)
    private String message;        // 예: "'원목 의자 나눔' 게시글에 새 메시지가 왔어요."

    @Column(nullable = false)
    private String link;           // 예: "/sharing/5/chat?roomId=3"

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

### 1.2 DB 테이블 (JPA ddl-auto=update 자동 생성)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | BIGINT PK AI | NO | 알림 ID |
| user_id | BIGINT | NO | 수신자 사용자 ID |
| type | VARCHAR(20) | NO | 알림 유형 ("CHAT") |
| title | VARCHAR(255) | NO | 알림 제목 |
| message | TEXT | NO | 알림 내용 |
| link | VARCHAR(255) | NO | 클릭 시 이동 경로 |
| is_read | BOOLEAN | NO | 읽음 여부 (기본 false) |
| created_at | DATETIME | NO | 생성 시각 |

---

## 2. Backend API 설계

### 2.1 API 엔드포인트

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/notifications?userId={id}` | 사용자 알림 목록 (최신순, 최대 50개) | `List<NotificationResponse>` |
| GET | `/api/notifications/unread-count?userId={id}` | 읽지 않은 알림 개수 | `{ "count": number }` |
| PATCH | `/api/notifications/{id}/read` | 단일 알림 읽음 처리 | 204 No Content |
| PATCH | `/api/notifications/read-all?userId={id}` | 전체 알림 읽음 처리 | 204 No Content |

### 2.2 NotificationResponse DTO

```java
@Getter @Builder
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean isRead;
    private String createdAt;  // "yyyy-MM-dd HH:mm:ss" 형식
}
```

### 2.3 UnreadCountResponse DTO

```java
@Getter @AllArgsConstructor
public class UnreadCountResponse {
    private long count;
}
```

---

## 3. Backend 클래스 설계

### 3.1 파일 구조

```
backend/src/main/java/com/throwit/domain/notification/
├── Notification.java                    // 엔티티
├── NotificationRepository.java          // JPA Repository
├── NotificationService.java             // 비즈니스 로직
├── NotificationController.java          // REST Controller
└── dto/
    ├── NotificationResponse.java        // 응답 DTO
    └── UnreadCountResponse.java         // 카운트 응답 DTO
```

### 3.2 NotificationRepository

```java
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
```

### 3.3 NotificationService

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /** 알림 생성 */
    @Transactional
    public void create(Long userId, String type, String title, String message, String link) { ... }

    /** 사용자 알림 목록 조회 */
    public List<NotificationResponse> getNotifications(Long userId) { ... }

    /** 읽지 않은 알림 개수 */
    public long getUnreadCount(Long userId) { ... }

    /** 단일 알림 읽음 */
    @Transactional
    public void markAsRead(Long notificationId) { ... }

    /** 전체 읽음 */
    @Transactional
    public void markAllAsRead(Long userId) { ... }
}
```

### 3.4 NotificationController

```java
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@RequestParam Long userId) { ... }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@RequestParam Long userId) { ... }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) { ... }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) { ... }
}
```

### 3.5 ChatMessageService 수정 (알림 생성 연동)

`send()` 메서드 내부에서 메시지 전송 후 알림 생성:

```java
// 기존 send() 내부에 추가
// 수신자 결정: 보낸 사람이 owner면 chatter에게, chatter면 owner에게
Long recipientId;
if (request.getSenderId().equals(room.getOwnerId())) {
    recipientId = room.getChatterId();
} else {
    recipientId = room.getOwnerId();
}

// SharingPost 제목 조회하여 알림 생성
SharingPost post = sharingPostRepository.findById(room.getSharingPostId()).orElse(null);
String postTitle = (post != null) ? post.getTitle() : "나눔 게시글";

notificationService.create(
    recipientId,
    "CHAT",
    "새로운 채팅",
    "'" + postTitle + "' 게시글에 새 메시지가 왔어요.",
    "/sharing/" + room.getSharingPostId() + "/chat?roomId=" + room.getId()
);
```

---

## 4. Frontend 설계

### 4.1 파일 구조

```
frontend/src/
├── services/
│   └── notificationService.ts           // (신규) 알림 API 클라이언트
├── stores/
│   └── useNotificationStore.ts          // (신규) 알림 카운트 zustand store
├── components/
│   └── layout/
│       └── Header.tsx                   // (수정) 뱃지 추가
├── pages/
│   └── notifications/
│       └── NotificationsPage.tsx        // (수정) 실제 API 데이터
└── App.tsx                              // (수정) 폴링 훅 연결
```

### 4.2 notificationService.ts

```typescript
import { apiFetch } from '@/lib/apiClient'

export interface NotificationResponse {
  id: number
  userId: number
  type: string
  title: string
  message: string
  link: string
  isRead: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

export const notificationService = {
  getNotifications(userId: number) {
    return apiFetch<NotificationResponse[]>(`/api/notifications?userId=${userId}`)
  },
  getUnreadCount(userId: number) {
    return apiFetch<UnreadCountResponse>(`/api/notifications/unread-count?userId=${userId}`)
  },
  markAsRead(notificationId: number) {
    return apiFetch<void>(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
  },
  markAllAsRead(userId: number) {
    return apiFetch<void>(`/api/notifications/read-all?userId=${userId}`, { method: 'PATCH' })
  },
}
```

### 4.3 useNotificationStore.ts (zustand)

```typescript
import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  decrement: () => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}))
```

### 4.4 Header.tsx 수정 - 뱃지 표시

알림 아이콘에 `unreadCount > 0`이면 빨간 뱃지 표시:

```tsx
// showNotification 부분 수정
{showNotification && (
  <button onClick={() => navigate('/notifications')} className="relative ...">
    <svg ... />
    {unreadCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    )}
  </button>
)}
```

### 4.5 HomePage.tsx 수정 - 알림 뱃지

홈 화면 오른쪽 위 알림 아이콘에도 동일한 뱃지 로직:

```tsx
<button onClick={() => navigate('/notifications')} className="relative p-1">
  <svg ... />
  {unreadCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</button>
```

### 4.6 App.tsx 수정 - 폴링 훅

App 컴포넌트 내부에서 로그인 상태일 때 30초 간격으로 unreadCount 폴링:

```tsx
function NotificationPoller() {
  const { user } = useAuth()
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!user) return
    const fetch = () => {
      notificationService.getUnreadCount(user.id)
        .then((r) => setUnreadCount(r.count))
        .catch(() => {})
    }
    fetch() // 즉시 1회 실행
    const interval = setInterval(fetch, 30000) // 30초
    return () => clearInterval(interval)
  }, [user, setUnreadCount])

  return null
}
```

### 4.7 NotificationsPage.tsx 수정

- 기존 MOCK_NOTIFICATIONS 제거
- API에서 실제 알림 데이터 fetch
- 알림 클릭 시 `markAsRead` 호출 후 해당 link로 navigate
- "모두 읽음" 버튼 추가
- 알림 읽음 상태에 따라 배경색 구분 (읽지 않은 알림: 연한 파란 배경)

---

## 5. 데이터 흐름

### 5.1 메시지 전송 → 알림 생성

```
[사용자A] → 메시지 전송 (POST /api/sharing/{postId}/chat/rooms/{roomId}/messages)
    → ChatMessageService.send()
        → ChatMessage 저장
        → ChatRoom.updateLastMessage()
        → 수신자 판별 (A가 owner면 chatter에게, A가 chatter면 owner에게)
        → NotificationService.create(recipientId, "CHAT", ...)
            → Notification 엔티티 DB 저장
```

### 5.2 알림 뱃지 폴링

```
[App.tsx NotificationPoller]
    → 30초마다 GET /api/notifications/unread-count?userId={id}
    → useNotificationStore.setUnreadCount(count)
    → Header/HomePage에서 unreadCount 읽어서 뱃지 렌더링
```

### 5.3 알림 클릭 → 읽음 처리

```
[NotificationsPage]
    → 알림 클릭
    → PATCH /api/notifications/{id}/read
    → useNotificationStore.decrement()
    → navigate(notification.link) → 채팅방으로 이동
```

---

## 6. 구현 순서 (체크리스트)

### Phase 1: Backend (신규 파일만, 기존 기능 미변경)

- [ ] `Notification.java` 엔티티 생성
- [ ] `NotificationRepository.java` 생성
- [ ] `NotificationResponse.java` DTO 생성
- [ ] `UnreadCountResponse.java` DTO 생성
- [ ] `NotificationService.java` 생성
- [ ] `NotificationController.java` 생성
- [ ] `ChatMessageService.java`에 알림 생성 로직 추가 (send 메서드만)

### Phase 2: Frontend (신규 파일)

- [ ] `notificationService.ts` 생성
- [ ] `useNotificationStore.ts` 생성

### Phase 3: Frontend (기존 파일 수정)

- [ ] `App.tsx`에 `NotificationPoller` 컴포넌트 추가
- [ ] `Header.tsx`에 뱃지 표시 로직 추가
- [ ] `HomePage.tsx` 알림 아이콘에 뱃지 추가
- [ ] `NotificationsPage.tsx`를 실제 API 데이터로 교체

---

## 7. 영향 범위

### 수정하는 기존 파일 (최소 변경)
| File | 변경 내용 |
|------|-----------|
| `ChatMessageService.java` | send() 메서드에 NotificationService.create() 호출 추가 |
| `App.tsx` | NotificationPoller 컴포넌트 추가 |
| `Header.tsx` | 알림 아이콘에 뱃지 표시 (useNotificationStore 연동) |
| `HomePage.tsx` | 알림 아이콘에 뱃지 표시 |
| `NotificationsPage.tsx` | Mock 데이터를 실제 API로 교체 |

### 건드리지 않는 기존 기능
- 기존 채팅 기능 (ChatRoom, ChatMessage, ChatMessageController 등)
- 나눔 게시글 CRUD
- 인증 (AuthContext, AuthService)
- 수수료 조회, 온라인 신고, 오프라인 안내 등 모든 기타 기능
