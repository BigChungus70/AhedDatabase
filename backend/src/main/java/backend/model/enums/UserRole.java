package backend.model.enums;

public enum UserRole {
    Admin,
    High,
    Mid,
    Low;

    public boolean hasAtLeast(UserRole required) {
        return this.ordinal() <= required.ordinal();
    }

    public String asAuthority() {
        return "ROLE_" + this.name();
    }
}
