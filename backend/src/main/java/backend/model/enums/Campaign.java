package backend.model.enums;

import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum Campaign {
    EidJoyFitr("بهجة عيد - فطر"),
    EidJoyAdha("بهجة عيد - أضحى"),
    YourSacrifice("أضحيتك"),
    GoodnessBasket("سلة خير"),
    GoodnessClothing("كسوة خير"),
    Warmth("دفى"),
    ChildrenDay("يوم الطفل"),
    OrphansDay("يوم اليتيم"),
    ReturnSafely("عودوا آمنين"),
    None("غير مصنف");

    private final String arabic;

    Campaign(String arabic) {
        this.arabic = arabic;
    }

    public String getArabic() {
        return arabic;
    }

    public static Map<String, String> asMap() {
        return Stream.of(values())
                .collect(Collectors.toMap(Enum::name, Campaign::getArabic));
    }
}