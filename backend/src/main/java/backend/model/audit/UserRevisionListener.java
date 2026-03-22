package backend.model.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

public class UserRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        CustomRevisionEntity rev = (CustomRevisionEntity) revisionEntity;

        rev.setTimeOfChange(LocalDateTime.now());

        var auth = SecurityContextHolder.getContext().getAuthentication();
        // Get username from Spring Security
        String username = auth != null
                ? auth.getName()
                : "anonymous";

        rev.setUsername(username);

        // Get role
        String role = "No Role";
        if (auth != null && auth.getAuthorities() != null && !auth.getAuthorities().isEmpty()) {
            String authority = auth.getAuthorities().iterator().next().getAuthority();
            role = authority.replace("ROLE_", "");
        }
        rev.setRole(role);


        // Capture HTTP method + URI
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest req = attrs.getRequest();
            rev.setHttpMethod(req.getMethod());
            rev.setRequestUri(req.getRequestURI());
        } else {
            rev.setHttpMethod("SYSTEM");
            rev.setRequestUri("N/A");
        }
    }
}
