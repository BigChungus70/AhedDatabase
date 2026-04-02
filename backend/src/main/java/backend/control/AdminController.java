package backend.control;

import backend.model.admin.AdminResponseDTO;
import backend.model.admin.UserAhedAuditDTO;
import backend.model.enums.UserRole;
import backend.service.admin.AdminService;
import backend.service.admin.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditService auditService;
    private final AdminService adminService;

    @GetMapping("/users/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getAllUsersHistory() {
        return ResponseEntity.ok(auditService.getAllUsersHistory());
    }

    @GetMapping("/user/{username}/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getUserHistory(@PathVariable String username) {
        return ResponseEntity.ok(auditService.getUserHistory(username));
    }

    @PostMapping("/users/history")
    public ResponseEntity<List<UserAhedAuditDTO>> getUsersHistory(@RequestBody List<String> usernames) {
        return ResponseEntity.ok(auditService.getUsersHistory(usernames));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AdminResponseDTO>> getAccounts() {
        return ResponseEntity.ok(adminService.getAccounts());
    }

    @PostMapping("/accounts")
    public ResponseEntity<Map<String, String>> createSlotAccount(@RequestParam UserRole role, @RequestParam String username) {
        return ResponseEntity.ok(adminService.createSlotAccount(username, role));
    }

    @PatchMapping("/accounts/{id}/rename")
    public ResponseEntity<AdminResponseDTO> renameAccount(@PathVariable Long id, @RequestParam String username) {
        return ResponseEntity.ok(adminService.renameAccount(id, username));
    }

    @PatchMapping("/accounts/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.resetPassword(id));
    }

    @PatchMapping("/accounts/{id}/role")
    public ResponseEntity<AdminResponseDTO> changeRole(@PathVariable Long id, @RequestParam UserRole role) {
        return ResponseEntity.ok(adminService.changeRole(id, role));
    }

    @PatchMapping("/accounts/{id}/toggle")
    public ResponseEntity<AdminResponseDTO> toggleAccount(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleAccount(id));
    }

    @DeleteMapping("/accounts/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteAccount(id));
    }
}