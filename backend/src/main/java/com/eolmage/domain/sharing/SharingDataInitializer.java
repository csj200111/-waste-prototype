package com.eolmage.domain.sharing;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
// @Component  // 비활성화: seed 데이터 더 이상 삽입하지 않음
@RequiredArgsConstructor
public class SharingDataInitializer implements CommandLineRunner {

    private final SharingPostRepository sharingPostRepository;

    @Override
    public void run(String... args) {
        if (sharingPostRepository.count() > 0) {
            log.info("나눔 게시글 데이터가 이미 존재합니다 ({}건). 스킵합니다.", sharingPostRepository.count());
            return;
        }

        log.info("나눔 게시글 seed 데이터를 삽입합니다...");

        LocalDateTime now = LocalDateTime.now();

        List<SharingPost> posts = List.of(
                // 강남구 (3개)
                buildPost("원목 의자 무료 나눔합니다", "상태 좋은 원목 의자입니다. 직접 수거 가능하신 분", "가구", "서울특별시", "강남구", "역삼동", "역삼역 근처", "김나눔", SharingStatus.SHARING, now.minusMinutes(10), 37.5000, 127.0366),
                buildPost("안 쓰는 스탠드 조명 가져가세요", "LED 스탠드 조명, 밝기 조절 가능합니다", "가전", "서울특별시", "강남구", "도곡동", "도곡역 1번 출구", "이조명", SharingStatus.SHARING, now.minusMinutes(45), 37.4870, 127.0370),
                buildPost("이사 정리로 1인용 책상 드립니다", "120x60cm 화이트 책상, 사용감 있으나 튼튼합니다", "가구", "서울특별시", "강남구", "대치동", "대치동 주민센터 앞", "박이사", SharingStatus.RESERVED, now.minusHours(2), 37.4945, 127.0575),

                // 서초구 (3개)
                buildPost("접이식 테이블 나눔", "캠핑용 접이식 테이블, 상태 양호", "가구", "서울특별시", "서초구", "서초동", "서초역 근처", "최캠핑", SharingStatus.SHARING, now.minusHours(3), 37.4920, 127.0070),
                buildPost("벽걸이 시계 가져가세요", "배터리 교체하면 잘 작동합니다", "생활용품", "서울특별시", "서초구", "반포동", "반포 주민센터", "정시계", SharingStatus.SHARING, now.minusDays(1), 37.5046, 126.9962),
                buildPost("아이 장난감 세트 나눔", "레고, 블록 등 장난감 모음", "기타", "서울특별시", "서초구", "잠원동", "잠원역 3번 출구", "한아이", SharingStatus.COMPLETED, now.minusDays(3), 37.5175, 127.0065),

                // 송파구 (3개)
                buildPost("아이 책상 나눔합니다", "초등학생용 높이 조절 책상", "가구", "서울특별시", "송파구", "잠실동", "잠실역 근처", "송학부모", SharingStatus.SHARING, now.minusMinutes(30), 37.5134, 127.1002),
                buildPost("선풍기 2대 무료 나눔", "작동 잘 되는 선풍기 2대, 한꺼번에 가져가실 분", "가전", "서울특별시", "송파구", "문정동", "문정역 4번 출구", "윤시원", SharingStatus.RESERVED, now.minusHours(5), 37.4848, 127.1230),
                buildPost("화분 3개 나눔해요", "다육식물 화분 3개, 건강합니다", "기타", "서울특별시", "송파구", "가락동", "가락시장역 앞", "강식물", SharingStatus.SHARING, now.minusHours(8), 37.4935, 127.1180),

                // 마포구 (3개)
                buildPost("전자레인지 나눔합니다", "삼성 전자레인지, 작동 잘 됩니다", "가전", "서울특별시", "마포구", "합정동", "합정역 근처", "오가전", SharingStatus.SHARING, now.minusHours(1), 37.5497, 126.9135),
                buildPost("원목 책장 가져가세요", "5단 원목 책장, 직접 수거 필수", "가구", "서울특별시", "마포구", "망원동", "망원역 2번 출구", "유책방", SharingStatus.SHARING, now.minusHours(6), 37.5561, 126.9098),
                buildPost("에어프라이어 나눔", "3.5L 에어프라이어, 사용감 있음", "가전", "서울특별시", "마포구", "연남동", "연남동 카페거리 근처", "임요리", SharingStatus.COMPLETED, now.minusDays(2), 37.5660, 126.9262),

                // 성동구 (3개)
                buildPost("러그 카펫 무료 나눔", "200x150cm 그레이 러그, 세탁 완료", "생활용품", "서울특별시", "성동구", "성수동", "성수역 근처", "한인테리어", SharingStatus.SHARING, now.minusMinutes(20), 37.5443, 127.0558),
                buildPost("식탁 의자 2개 드려요", "원목 식탁 의자 2개 세트", "가구", "서울특별시", "성동구", "행당동", "행당역 1번 출구", "배식탁", SharingStatus.SHARING, now.minusHours(4), 37.5555, 127.0295),
                buildPost("공기청정기 나눔합니다", "소형 공기청정기, 필터 교체 필요", "가전", "서울특별시", "성동구", "옥수동", "옥수역 앞", "서공기", SharingStatus.RESERVED, now.minusDays(1), 37.5420, 127.0180),

                // 영등포구 (3개)
                buildPost("철제 2단 선반 나눔", "조립식 철제 선반, 견고합니다", "가구", "서울특별시", "영등포구", "여의도동", "여의도역 근처", "노선반", SharingStatus.SHARING, now.minusHours(2), 37.5219, 126.9245),
                buildPost("가습기 가져가세요", "초음파 가습기, 작동 잘 됩니다", "가전", "서울특별시", "영등포구", "당산동", "당산역 앞", "문가습", SharingStatus.SHARING, now.minusHours(7), 37.5339, 126.9028),
                buildPost("커튼 2세트 나눔", "아이보리색 암막커튼 2세트", "생활용품", "서울특별시", "영등포구", "영등포동", "영등포시장역 근처", "양커튼", SharingStatus.COMPLETED, now.minusDays(4), 37.5157, 126.9074),

                // 용산구 (3개)
                buildPost("빈백 소파 나눔합니다", "1인용 빈백 소파, 커버 세탁 가능", "가구", "서울특별시", "용산구", "이태원동", "이태원역 근처", "권소파", SharingStatus.SHARING, now.minusMinutes(50), 37.5340, 126.9946),
                buildPost("전기포트 드립니다", "1.7L 전기포트, 상태 좋아요", "가전", "서울특별시", "용산구", "한남동", "한남역 2번 출구", "조전기", SharingStatus.SHARING, now.minusHours(3), 37.5337, 127.0007),
                buildPost("요가매트 나눔", "사용감 적은 요가매트", "기타", "서울특별시", "용산구", "용산동", "용산역 앞", "황운동", SharingStatus.SHARING, now.minusDays(1), 37.5298, 126.9648),

                // 강서구 (3개)
                buildPost("세탁기 무료 나눔", "10kg 통돌이 세탁기, 작동 OK", "가전", "서울특별시", "강서구", "화곡동", "화곡역 근처", "안세탁", SharingStatus.SHARING, now.minusHours(1), 37.5415, 126.8490),
                buildPost("옷걸이 행거 드려요", "이동식 옷걸이 행거", "생활용품", "서울특별시", "강서구", "등촌동", "등촌역 3번 출구", "천옷장", SharingStatus.RESERVED, now.minusHours(9), 37.5504, 126.8641),
                buildPost("전신거울 나눔합니다", "벽걸이 전신거울, 깨짐 없음", "생활용품", "서울특별시", "강서구", "발산동", "발산역 앞", "류거울", SharingStatus.SHARING, now.minusDays(2), 37.5533, 126.8379),

                // 노원구 (3개)
                buildPost("컴퓨터 모니터 나눔", "24인치 모니터, 정상 작동", "가전", "서울특별시", "노원구", "상계동", "상계역 근처", "강모니터", SharingStatus.SHARING, now.minusMinutes(15), 37.6538, 127.0724),
                buildPost("수납장 가져가세요", "3단 플라스틱 수납장", "가구", "서울특별시", "노원구", "중계동", "중계역 1번 출구", "심수납", SharingStatus.SHARING, now.minusHours(5), 37.6413, 127.0773),
                buildPost("전기 히터 나눔", "소형 전기 히터, 겨울 대비", "가전", "서울특별시", "노원구", "공릉동", "공릉역 앞", "탁히터", SharingStatus.COMPLETED, now.minusDays(5), 37.6256, 127.0790),

                // 중구 (3개)
                buildPost("미니 냉장고 나눔합니다", "원룸용 미니 냉장고", "가전", "서울특별시", "중구", "신당동", "신당역 근처", "고냉장", SharingStatus.SHARING, now.minusHours(2), 37.5615, 127.0064),
                buildPost("접이식 의자 2개 드려요", "캠핑용 접이식 의자 2개", "가구", "서울특별시", "중구", "충무로동", "충무로역 앞", "마캠핑", SharingStatus.SHARING, now.minusHours(10), 37.5574, 126.9946),
                buildPost("다리미 나눔해요", "스팀 다리미, 상태 양호", "가전", "서울특별시", "중구", "을지로동", "을지로역 3번 출구", "하다리미", SharingStatus.RESERVED, now.minusDays(1), 37.5660, 126.9900),

                // 시흥시 (3개)
                buildPost("유아용 자전거 나눔합니다", "16인치 보조바퀴 자전거, 상태 양호", "기타", "경기도", "시흥시", "연성동", "연성동 주민센터 근처", "김시흥", SharingStatus.SHARING, now.minusMinutes(25), 37.3800, 126.8020),
                buildPost("제습기 무료 나눔", "소형 제습기, 정상 작동합니다", "가전", "경기도", "시흥시", "신천동", "시흥시청역 근처", "박제습", SharingStatus.SHARING, now.minusHours(2), 37.3770, 126.8110),
                buildPost("접이식 빨래건조대 드려요", "3단 빨래건조대, 사용감 있으나 튼튼", "생활용품", "경기도", "시흥시", "장곡동", "장곡동 이마트 앞", "이건조", SharingStatus.SHARING, now.minusHours(5), 37.3890, 126.8200)
        );

        sharingPostRepository.saveAll(posts);
        log.info("나눔 게시글 seed 데이터 {}건 삽입 완료", posts.size());
    }

    private SharingPost buildPost(String title, String description, String category,
                                   String sido, String sigungu, String dong,
                                   String preferredPlace, String authorNickname,
                                   SharingStatus status, LocalDateTime createdAt,
                                   Double latitude, Double longitude) {
        return SharingPost.builder()
                .title(title)
                .description(description)
                .category(category)
                .sido(sido)
                .sigungu(sigungu)
                .dong(dong)
                .preferredPlace(preferredPlace)
                .authorNickname(authorNickname)
                .status(status)
                .createdAt(createdAt)
                .latitude(latitude)
                .longitude(longitude)
                .build();
    }
}
