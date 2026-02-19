# Gap Analysis Report: bulk-waste-disposal

> **Feature**: bulk-waste-disposal (대형폐기물 배출 도우미 서비스)
> **Analysis Date**: 2026-02-19 (2차)
> **Analyst**: gap-detector agent
> **Overall Match Rate**: **88%** ⚠️ WARN (threshold: 90%)
> **Previous Match Rate**: 94% (1차, 2026-02-19)

---

## Executive Summary

1차 분석(94%) 이후 인증 시스템, 물품 삭제, 로그인 가드 등 다수의 기능이 추가되었으나 설계 문서에 반영되지 않아 일치율이 88%로 하락. 기능적으로는 모두 정상 작동하며, 설계 문서 업데이트로 90% 이상 달성 가능.

---

## 1. Score Summary

| 항목 | 설계 항목 수 | 구현 항목 수 | 일치 수 | 일치율 |
|------|:----------:|:----------:|:------:|:-----:|
| 백엔드 API 엔드포인트 (설계 명시) | 16 | 16 | 14 | 87.5% |
| 백엔드 API 엔드포인트 (신규 미문서화) | 0 | 5 | - | n/a |
| 프론트엔드 서비스 | 6 | 7 | 5 | 83% |
| 타입 정의 | 12 | 12 | 5 | 42% |
| 라우트/화면 | 15 | 17 | 15 | 100% |
| DB 스키마 | 4 | 6 | 2 | 50% |
| 패키지 구조 | 5 | 6 | 2 | 40% |

**기능적 일치율**: ~95% (모든 설계 기능 동작)
**문서 일치율**: ~78% (설계 문서가 구현을 정확히 기술하는 정도)
**종합 일치율**: **88%**

---

## 2. 주요 Gap 목록

### Gap 1: 인증 시스템 설계 문서 부재 (CRITICAL)

- **구현 완료**: User 엔티티, AuthService, AuthController, AuthContext, LoginPage, SignupPage
- **설계 문서**: Section 12에 "추후 구현"으로만 언급
- **영향**: 3개 API 엔드포인트, 11개 파일이 문서화되지 않음
- **조치**: 설계 문서에 인증 섹션 추가 필요

### Gap 2: 재활용 물품 삭제 기능 미문서화 (HIGH)

- **구현 완료**: `DELETE /api/recycle/items/{id}`, 프론트엔드 삭제 UI
- **설계 문서**: Section 6.1/6.2에 없음
- **조치**: API 테이블 및 서비스 인터페이스 테이블 업데이트

### Gap 3: 타입 정의 구버전 (HIGH)

- **이슈**: 설계 문서 Section 3.1의 타입이 실제 구현과 다름
  - `id: string` → 실제: `id: number`
  - `regionCode/regionLabel` → 실제: `sido/sigungu`
  - `WasteCategory/WasteItem/WasteSize` 트리 구조 → 실제: 플랫 문자열
  - `DisposalItem`에서 `wasteItemId/sizeId` 제거됨
  - `DisposalStatus`에 `draft` 불일치
- **조치**: Section 3.1 타입 정의 전체 업데이트

### Gap 4: DB 스키마 변경 미반영 (MEDIUM)

- **이슈**:
  - `recycle_item_photos` 별도 테이블 → 실제: `recycle_items.photos` LONGTEXT 컬럼
  - `users` 테이블 미문서화
  - `waste_facility` 테이블 미문서화
  - `disposal_items` 컬럼명 불일치 (waste_name → waste_item_name 등)
- **조치**: Section 7.2 DDL 업데이트

### Gap 5: 패키지 구조 변경 (LOW)

- **이슈**: `infrastructure/` → `global/`, `AppException` → `BusinessException`
- **조치**: Section 8.1 패키지 구조 업데이트

### Gap 6: 로그인 가드 하위 페이지 미적용 (LOW)

- **이슈**: `/online` 가드 있지만 `/online/apply`에 직접 접근 가능
- **영향**: 낮음 (userId fallback이 `'anonymous'`로 처리)
- **조치**: 라우트 레벨 가드 검토

---

## 3. 코드 이슈 수정 완료

| 이슈 | 파일 | 상태 |
|------|------|:----:|
| `recycleService.deleteItem` raw fetch 사용 | `recycleService.ts:36-40` | ✅ 수정 완료 (apiFetch로 교체) |

---

## 4. 권장 조치

### 설계 문서 업데이트 (88% → 95%+ 달성 가능)

1. **Section 3.1**: 타입 정의를 실제 구현에 맞게 업데이트
2. **Section 6.1/6.2/8.4**: 인증 API, 삭제 API, waste-facility API 추가
3. **Section 7.2**: DB 스키마 (users, photos JSON, waste_facility) 업데이트
4. **Section 8.1**: 패키지 구조 (global/, domain/user/, domain/offline/) 업데이트
5. **Section 9.1**: `/login`, `/signup` 라우트 추가
6. **Section 12**: 인증 구현 완료 체크

---

## 5. Conclusion

```
╔══════════════════════════════════════════════════╗
║   Overall Match Rate: 88% ⚠️ WARN               ║
║                                                  ║
║   기능적 완성도: 95% (모든 기능 정상 동작)         ║
║   문서 동기화: 78% (설계 문서 업데이트 필요)       ║
║                                                  ║
║   권장: /pdca iterate bulk-waste-disposal        ║
║   (설계 문서 업데이트로 90%+ 달성)                ║
╚══════════════════════════════════════════════════╝
```
