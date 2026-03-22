package backend.model.enums;

public class ExpirationDates {

    public static final Long refreshTokenExpirationDate = 1000L * 60 * 60 * 24 * 1; // 1 Day
    public static final Long accessTokenExpirationDate = 1000L * 60 * 15; // 15 Mins
}
