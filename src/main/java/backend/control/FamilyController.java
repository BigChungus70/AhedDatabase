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
@RequestMapping("/family")
public class FamilyController {

    private final FamilyService familyService;

    @GetMapping("/listAll")
    public ResponseEntity<List<Family>> getAll() {
        return ResponseEntity.ok(familyService.getAllFamilies());
    }

    @GetMapping("/getFamily")
    public ResponseEntity<Family> getFamilyByCode(@RequestParam String code) {
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

    @GetMapping("/allCount")
    public ResponseEntity<Long> getFamilyCount() {
        return ResponseEntity.ok(familyService.getAllFamiliesCount());
    }

    @GetMapping("/nonArchivedCount")
    public ResponseEntity<Long> getNonArchivedFamilyCount() {
        return ResponseEntity.ok(familyService.getAllNonArchivedFamiliesCount());
    }

    @PutMapping("/update")
    public ResponseEntity<Family> updateFamily(@RequestBody Family family) {
        return ResponseEntity.ok(familyService.updateFamily(family));
    }

    @PostMapping("/add")
    public ResponseEntity<Family> addFamily(@RequestBody Family family) {
        return ResponseEntity.ok(familyService.saveFamily(family));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Family> deleteFamily(@RequestParam String code) {
        return ResponseEntity.ok(familyService.deleteFamily(code));
    }

}
