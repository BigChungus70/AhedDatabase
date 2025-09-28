package backend.control;

import backend.model.audit.UserAhedAuditDTO;
import backend.service.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditService auditService;

    @GetMapping("/users/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getAllUsersHistory() {
        List<UserAhedAuditDTO> history = auditService.getAllUsersHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{username}/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getUserHistory(@PathVariable String username) {
        List<UserAhedAuditDTO> history = auditService.getUserHistory(username);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/users/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getUsersHistory(@RequestBody List<String> usernames) {
        List<UserAhedAuditDTO> history = auditService.getUsersHistory(usernames);
        return ResponseEntity.ok(history);
    }
}