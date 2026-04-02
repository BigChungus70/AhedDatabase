package backend.model.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAhedAuditDTO {
    private String changerUsername;
    private String changerRole;
    private LocalDateTime timeOfChange;
    private String httpMethod;
    private String requestUri;
    private Long entityId;
    private String tableName;
    private Map<String, FieldChange> changes;
}
