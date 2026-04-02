package backend.control;

import backend.model.DTO.*;
import backend.model.SavedList;
import backend.service.SavedListService;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
@RestController
@RequiredArgsConstructor
@RequestMapping("/lists")
@PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High')")
public class SavedListController {
    private final SavedListService savedListService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<SavedListDetailsDTO> getList(@PathVariable Long id) {
        return ResponseEntity.ok(savedListService.getList(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid', 'ROLE_Low')")
    public ResponseEntity<List<SavedListSummaryDTO>> getAllLists() {
        return ResponseEntity.ok(savedListService.getAllLists());
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid', 'ROLE_Low')")
    public ResponseEntity<Map<String, String>> getCampaigns() {
        return ResponseEntity.ok(savedListService.getCampaigns());
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<Long> getListCount() {
        return ResponseEntity.ok(savedListService.getListCount());
    }

    @PostMapping
    public ResponseEntity<SavedListDetailsDTO> createList(@RequestBody SavedListCreateDTO dto) {
        if (dto.name() == null || dto.familyCodes() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(savedListService.createList(dto.name(), dto.description(), dto.campaign(), dto.familyCodes()));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High')")
    public ResponseEntity<SavedListUpdateDTO> updateList(@PathVariable Long id, @RequestBody SavedListUpdateDTO dto) {
        return ResponseEntity.ok(savedListService.updateList(id, dto.name(), dto.description(), dto.campaign()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SavedListDeleteDTO> deleteList(@PathVariable Long id) {
        return ResponseEntity.ok(savedListService.deleteList(id));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<SavedListSummaryDTO> archiveList(@PathVariable Long id) {
        return ResponseEntity.ok(savedListService.archiveList(id));
    }

    @PatchMapping("/{id}/report")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid', 'ROLE_Low')")
    public ResponseEntity<SavedListUpdateReportDTO> updateReport(@PathVariable Long id, @RequestBody @Nullable String report) {
        return ResponseEntity.ok(savedListService.updateReport(id, report));
    }

    @GetMapping("/{id}/export")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid', 'ROLE_Low')")
    public ResponseEntity<byte[]> exportList(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean residence,
            @RequestParam(defaultValue = "false") boolean children,
            @RequestParam(required = false) Integer minDOB,
            @RequestParam(required = false) Integer maxDOB) {

        byte[] excel = savedListService.exportList(id, residence, children, minDOB, maxDOB);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=list_" + id + ".xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excel);
    }

    @PutMapping("/{id}/entries")
    public ResponseEntity<SavedListDetailsDTO> addFamilies(@PathVariable Long id, @RequestBody List<String> codes) {
        if (codes == null || codes.isEmpty()) return ResponseEntity.badRequest().body(null);
        return ResponseEntity.ok(savedListService.addFamilies(id, codes));
    }

    @DeleteMapping("/{id}/entries")
    public ResponseEntity<SavedListDetailsDTO> removeFamilies(@PathVariable Long id, @RequestBody List<String> codes) {
        if (codes == null || codes.isEmpty()) return ResponseEntity.badRequest().body(null);
        return ResponseEntity.ok(savedListService.removeFamilies(id, codes));
    }

    @PatchMapping("/{id}/entries/{familyId}/toggle")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<SavedListDoneToggleDTO> toggleFamilyDone(@PathVariable Long id, @PathVariable Long familyId) {
        return ResponseEntity.ok(savedListService.toggleFamilyDone(id, familyId));
    }

    @PatchMapping("/entries/{entryId}/notes")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<SavedListUpdateNotesDTO> updateNotes(@PathVariable Long entryId, @RequestBody SavedListUpdateNotesDTO dto) {
        return ResponseEntity.ok(savedListService.updateNotes(entryId, dto));
    }
}
