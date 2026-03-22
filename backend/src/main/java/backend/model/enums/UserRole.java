package backend.model.enums;

public enum UserRole {
    Normal,
    Elevated,
    Admin;

    public boolean hasAtLeast(UserRole required) {
        return this.ordinal() >= required.ordinal();
    }

    public String asAuthority() {
        return "ROLE_" + this.name();
    }
}
