package backend.control;


import backend.model.Family;
import backend.model.enums.ArchiveOption;
import backend.model.enums.FamilyCondition;
import backend.service.FamilyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/families")
@PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High')")
public class FamilyController {

    private final FamilyService familyService;

    @GetMapping
    public ResponseEntity<List<Family>> getAllFamilies() {
        return ResponseEntity.ok(familyService.getAllFamilies());
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<Family> getFamily(@PathVariable String code) {
        return ResponseEntity.ok(familyService.getFamily(code));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Family>> searchFamilies(
            @RequestParam(required = false) boolean filterByLowercaseFirstLetter,
            @RequestParam(required = false) List<FamilyCondition> conditions,
            @RequestParam(required = false) List<String> areas,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) ArchiveOption archiveOption,
            @RequestParam(required = false) boolean priorityOnly,
            @RequestParam(required = false) String searchText) {
        List<Family> families = familyService.searchFamilies(
                filterByLowercaseFirstLetter, conditions, areas, minAge, maxAge, archiveOption, priorityOnly, searchText);
        return ResponseEntity.ok(families);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getFamilyCount() {
        return ResponseEntity.ok(familyService.getAllFamiliesCount());
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> getNonArchivedFamilyCount() {
        return ResponseEntity.ok(familyService.getAllNonArchivedFamiliesCount());
    }

    @PutMapping("/{code}")
    @PreAuthorize("hasAnyAuthority('ROLE_Admin', 'ROLE_High', 'ROLE_Mid')")
    public ResponseEntity<Family> updateFamily(@RequestBody Family family) {
        return ResponseEntity.ok(familyService.updateFamily(family));
    }

    @PostMapping
    public ResponseEntity<Family> addFamily(@RequestBody Family family) {
        return ResponseEntity.ok(familyService.saveFamily(family));
    }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Family> deleteFamily(@PathVariable String code) {
        return ResponseEntity.ok(familyService.deleteFamily(code));
    }
}
