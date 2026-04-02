package backend.service.admin;

import backend.model.UserAhed;
import backend.model.admin.FieldChange;
import backend.model.admin.UserAhedAuditDTO;
import backend.model.admin.CustomRevisionEntity;
import backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.springframework.stereotype.Service;

import java.util.*;
@Service
@RequiredArgsConstructor
public class AuditService {

    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public List<UserAhedAuditDTO> getAllUsersHistory() {
        List<Long> allUserIds = userRepository.findAllUserIds();
        List<UserAhedAuditDTO> allHistory = new ArrayList<>();

        for (Long userId : allUserIds) {
            allHistory.addAll(getUserHistoryById(userId));
        }

        return allHistory.stream()
                .sorted(Comparator.comparing(UserAhedAuditDTO::getTimeOfChange).reversed())
                .toList();
    }

    public List<UserAhedAuditDTO> getUserHistory(String username) {
        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"))
                .getId();

        return getUserHistoryById(userId);
    }

    public List<UserAhedAuditDTO> getUsersHistory(List<String> usernames) {
        List<UserAhedAuditDTO> combinedHistory = new ArrayList<>();

        for (String username : usernames) {
            try {
                combinedHistory.addAll(getUserHistory(username));
            } catch (EntityNotFoundException e) {
                // Skip missing users
            }
        }

        return combinedHistory.stream()
                .sorted(Comparator.comparing(UserAhedAuditDTO::getTimeOfChange).reversed())
                .toList();
    }

    private List<UserAhedAuditDTO> getUserHistoryById(Long userId) {
        AuditReader reader = AuditReaderFactory.get(entityManager);
        List<Number> revisions = reader.getRevisions(UserAhed.class, userId);

        List<UserAhedAuditDTO> history = new ArrayList<>();

        for (int i = 0; i < revisions.size(); i++) {
            Number currentRev = revisions.get(i);

            UserAhed currentUserAhed = reader.find(UserAhed.class, userId, currentRev);
            CustomRevisionEntity revInfo = reader.findRevision(CustomRevisionEntity.class, currentRev);

            UserAhed previousUserAhed = null;
            if (i > 0) {
                Number previousRev = revisions.get(i - 1);
                previousUserAhed = reader.find(UserAhed.class, userId, previousRev);
            }

            Map<String, FieldChange> changes = getChanges(previousUserAhed, currentUserAhed);

            UserAhedAuditDTO auditDTO = UserAhedAuditDTO.builder()
                    .changerUsername(revInfo.getUsername())
                    .changerRole(revInfo.getRole())
                    .timeOfChange(revInfo.getTimeOfChange())
                    .httpMethod(revInfo.getHttpMethod())
                    .requestUri(revInfo.getRequestUri())
                    .entityId(userId)
                    .tableName("UserAhed")
                    .changes(changes)
                    .build();

            history.add(auditDTO);
        }

        return history.stream()
                .sorted(Comparator.comparing(UserAhedAuditDTO::getTimeOfChange).reversed())
                .toList();
    }

    private Map<String, FieldChange> getChanges(UserAhed before, UserAhed after) {
        Map<String, FieldChange> changes = new HashMap<>();

        if (before == null) {
            // Creation
            changes.put("username", new FieldChange(null, after.getUsername()));
            changes.put("role", new FieldChange(null, after.getRole().name()));
            return changes;
        }

        if (!Objects.equals(before.getUsername(), after.getUsername())) {
            changes.put("username", new FieldChange(before.getUsername(), after.getUsername()));
        }

        if (!Objects.equals(before.getRole(), after.getRole())) {
            changes.put("role", new FieldChange(before.getRole().name(), after.getRole().name()));
        }

        return changes;
    }
}