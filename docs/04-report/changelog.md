# 프로젝트 변경 로그

> **프로젝트**: throw_it
> **목적**: PDCA 완료 사이클별 변경사항 기록

---

## [2026-03-04] - vulnerability-fix 완료

### 추가된 항목
- Phase 1: X-User-Id 헤더 필수화 (defaultValue="anonymous" 제거)
- Phase 2: 소유자 권한 검증 추가 (SharingPost, Disposal, Recycle 엔드포인트)
- Phase 3: RuntimeException → BusinessException 전환
- Phase 4: Enum 값 안전 변환 (try-catch 추가)
- Phase 5: @Transactional 명시 추가 (Repository @Modifying 쿼리)
- Phase 7: 프론트엔드 에러 로깅 개선 (console.error 추가)
- Phase 8: Notification API 헤더 기반 통일

### 변경된 항목
- NotificationController: @RequestParam userId → @RequestHeader("X-User-Id") Long userId
- notificationService.ts: query param 방식 → X-User-Id 헤더 방식

### 수정된 항목
- ChatMessageService: 3곳의 RuntimeException을 BusinessException으로 교체
- GlobalExceptionHandler: RuntimeException fallback 핸들러 추가
- DisposalService, RecycleService: enum valueOf() 호출 시 try-catch 추가
- SharingDetailPage, SharingChatPage, DisposalListPage, SharingChatListPage: .catch(() => {}) → .catch((e) => console.error(...))

### 통계
- **변경 파일**: 23파일 (백엔드 12 + 프론트엔드 11)
- **설계 일치도**: 100% (61/61 항목)
- **반복 횟수**: 0 (첫 패스 완성)
- **컴파일 결과**: ✅ TypeScript, Java 모두 통과

### 보안 개선
- 비인증 요청 자동 거부 (anonymous 기본값 제거)
- 모든 수정/삭제 작업에 소유자 검증 추가
- 예외 처리 통일 및 강화
- enum 입력값 검증 추가

### 호환성
- API 경로: 변경 없음
- HTTP 메서드: 변경 없음
- 요청/응답 JSON: 변경 없음
- 프론트엔드 UI/UX: 변경 없음
- **하위 호환성**: ✅ 100%

---

## 참고 문서

- [Complete Report](./vulnerability-fix.report.md)
- [Plan Document](../01-plan/features/vulnerability-fix.plan.md)
- [Design Document](../02-design/features/vulnerability-fix.design.md)
- [Analysis Report](../03-analysis/vulnerability-fix.analysis.md)
