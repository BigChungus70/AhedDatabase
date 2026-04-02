package backend.config;

import backend.model.UserAhed;
import backend.model.enums.UserRole;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    public static UserRole getCurrentUserRole() {
        return ((UserAhed) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal())
                .getRole();
    }

    public static UserAhed getCurrentUser() {
        return (UserAhed) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }
}