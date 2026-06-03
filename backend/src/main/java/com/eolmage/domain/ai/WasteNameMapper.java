package com.eolmage.domain.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class WasteNameMapper {

    private static final Map<String, MappedWaste> CLASS_MAP = new HashMap<>();

    /**
     * 평가 데이터 기준 정확도 50% 이상 + 샘플 5장 이상인 신뢰 클래스.
     * 이 목록에 없는 클래스는 AI 판별 불가로 처리한다.
     */
    public static final Set<String> RELIABLE_CLASSES = Set.of(
            "의자",       // 84.7%  360장
            "자전거",     // 83.3%    6장
            "냉장고",     // 80.0%   65장
            "세탁기",     // 69.6%   23장
            "선풍기",     // 66.7%   30장
            "청소기",     // 64.3%   28장
            "서랍장",     // 61.5%  148장
            "텔레비젼",   // 60.0%   10장
            "밥상",       // 57.7%  104장
            "소파류"      // 53.5%   99장
    );

    static {
        // ── 개별 클래스 (병합 대상 아님) ──
        CLASS_MAP.put("가스오븐레인지", new MappedWaste("가스오븐레인지", "가전류"));
        CLASS_MAP.put("개수대류", new MappedWaste("개수대", "주방용품"));
        CLASS_MAP.put("거울", new MappedWaste("거울", "생활용품"));
        CLASS_MAP.put("김치냉장고", new MappedWaste("김치냉장고", "가전류"));
        CLASS_MAP.put("난로", new MappedWaste("난로", "가전류"));
        CLASS_MAP.put("냉장고", new MappedWaste("냉장고", "가전류"));
        CLASS_MAP.put("다리미판", new MappedWaste("다리미판", "생활용품"));
        CLASS_MAP.put("도마", new MappedWaste("도마", "주방용품"));
        CLASS_MAP.put("문짝", new MappedWaste("문짝", "기타"));
        CLASS_MAP.put("밥상", new MappedWaste("밥상", "가구류"));
        CLASS_MAP.put("벽걸이시계", new MappedWaste("벽걸이시계", "생활용품"));
        CLASS_MAP.put("변기통", new MappedWaste("변기", "기타"));
        CLASS_MAP.put("병풍", new MappedWaste("병풍", "생활용품"));
        CLASS_MAP.put("보행기", new MappedWaste("보행기", "기타"));
        CLASS_MAP.put("복사기", new MappedWaste("복사기", "가전류"));
        CLASS_MAP.put("블라인드", new MappedWaste("블라인드", "생활용품"));
        CLASS_MAP.put("비데", new MappedWaste("비데", "가전류"));
        CLASS_MAP.put("빨래건조대", new MappedWaste("빨래건조대", "생활용품"));
        CLASS_MAP.put("서랍장", new MappedWaste("서랍장", "가구류"));
        CLASS_MAP.put("선풍기", new MappedWaste("선풍기", "가전류"));
        CLASS_MAP.put("세탁기", new MappedWaste("세탁기", "가전류"));
        CLASS_MAP.put("소파류", new MappedWaste("소파", "가구류"));
        CLASS_MAP.put("스피커", new MappedWaste("스피커", "가전류"));
        CLASS_MAP.put("식기건조기", new MappedWaste("식기건조기", "가전류"));
        CLASS_MAP.put("식탁", new MappedWaste("식탁", "가구류"));
        CLASS_MAP.put("신발장", new MappedWaste("신발장", "가구류"));
        CLASS_MAP.put("액자", new MappedWaste("액자", "생활용품"));
        CLASS_MAP.put("에어콘", new MappedWaste("에어컨", "가전류"));
        CLASS_MAP.put("옥매트", new MappedWaste("옥매트", "생활용품"));
        CLASS_MAP.put("완구류", new MappedWaste("완구", "기타"));
        CLASS_MAP.put("욕조", new MappedWaste("욕조", "기타"));
        CLASS_MAP.put("유모차", new MappedWaste("유모차", "기타"));
        CLASS_MAP.put("의자", new MappedWaste("의자", "가구류"));
        CLASS_MAP.put("입간판", new MappedWaste("입간판", "기타"));
        CLASS_MAP.put("자전거", new MappedWaste("자전거", "기타"));
        CLASS_MAP.put("장롱", new MappedWaste("장롱", "가구류"));
        CLASS_MAP.put("전축(오디오)", new MappedWaste("오디오", "가전류"));
        CLASS_MAP.put("정수기", new MappedWaste("정수기", "가전류"));
        CLASS_MAP.put("조명기구", new MappedWaste("조명기구", "생활용품"));
        CLASS_MAP.put("차탁자", new MappedWaste("차탁자", "가구류"));
        CLASS_MAP.put("책상", new MappedWaste("책상", "가구류"));
        CLASS_MAP.put("청소기", new MappedWaste("청소기", "가전류"));
        CLASS_MAP.put("침대", new MappedWaste("침대", "가구류"));
        CLASS_MAP.put("캐비닛류", new MappedWaste("캐비닛", "가구류"));
        CLASS_MAP.put("커튼", new MappedWaste("커튼", "생활용품"));
        CLASS_MAP.put("타이어", new MappedWaste("타이어", "기타"));
        CLASS_MAP.put("텐트", new MappedWaste("텐트", "기타"));
        CLASS_MAP.put("텔레비전대", new MappedWaste("TV대", "가구류"));
        CLASS_MAP.put("텔레비젼", new MappedWaste("텔레비전", "가전류"));
        CLASS_MAP.put("파티션", new MappedWaste("파티션", "가구류"));
        CLASS_MAP.put("프린트기", new MappedWaste("프린터", "가전류"));
        CLASS_MAP.put("피아노", new MappedWaste("피아노", "기타"));
        CLASS_MAP.put("항아리류", new MappedWaste("항아리", "기타"));
        CLASS_MAP.put("협탁", new MappedWaste("협탁", "가구류"));
        CLASS_MAP.put("화장대", new MappedWaste("화장대", "가구류"));
        CLASS_MAP.put("화장품함", new MappedWaste("화장품함", "생활용품"));
        CLASS_MAP.put("히터류", new MappedWaste("히터", "가전류"));
        CLASS_MAP.put("전자레인지", new MappedWaste("전자레인지", "가전류"));

        // ── 병합 클래스 (유사 항목 통합) ──
        CLASS_MAP.put("가방류", new MappedWaste("가방", "기타"));
        CLASS_MAP.put("장식장류", new MappedWaste("장식장", "가구류"));
        CLASS_MAP.put("책장류", new MappedWaste("책장", "가구류"));
        CLASS_MAP.put("바닥깔개류", new MappedWaste("카펫", "생활용품"));
        CLASS_MAP.put("침구류", new MappedWaste("이불", "침구류"));
        CLASS_MAP.put("통류", new MappedWaste("쓰레기통", "기타"));
        CLASS_MAP.put("운동기구류", new MappedWaste("러닝머신", "운동기구"));
        CLASS_MAP.put("긴막대류", new MappedWaste("옷걸이", "생활용품"));
    }

    public MappedWaste map(String aiClassName) {
        if ("broken".equals(aiClassName) || "scratch".equals(aiClassName)) {
            return null;
        }
        return CLASS_MAP.getOrDefault(aiClassName, new MappedWaste(aiClassName, "기타"));
    }

    @Getter
    @AllArgsConstructor
    public static class MappedWaste {
        private final String wasteName;
        private final String wasteCategory;
    }
}
