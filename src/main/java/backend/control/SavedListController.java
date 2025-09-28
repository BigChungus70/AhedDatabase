package backend.control;

import backend.model.DTO.*;
import backend.model.Family;
import backend.model.SavedList;
import backend.service.SavedListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lists")
public class SavedListController {
    private final SavedListService savedListService;


    @GetMapping("/getList")
    public ResponseEntity<SavedListDetailsDTO> getFamilies(@RequestParam Long id) {
        return ResponseEntity.ok(savedListService.getFamiliesForList(id));
    }

    @GetMapping("/listAll")
    public ResponseEntity<List<SavedListSummaryDTO>> getAllSavedLists() {
        return ResponseEntity.ok(savedListService.getSavedLists());
    }
    @GetMapping("/getCampaigns")
    public ResponseEntity<Map<String,String>> getCampaigns() {
        return ResponseEntity.ok(savedListService.getCampaigns());
    }

    @PostMapping
    public ResponseEntity<SavedListDetailsDTO> createList(@RequestBody SavedListCreateDTO dto) {
        if(dto.name() == null || dto.familyCodes() == null)
        {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(savedListService.createList(dto.name(), dto.description(), dto.campaign(), dto.familyCodes()));
    }

    @PatchMapping("/updateNotes")
    public ResponseEntity<SavedListUpdateNotesDTO> updateNote(@RequestParam Long entryId, @RequestBody SavedListUpdateNotesDTO newNotes ) {

        return ResponseEntity.ok(savedListService.updateNotes(entryId ,newNotes));

    }

    @PutMapping("/addFamilies")
    public ResponseEntity<SavedListDetailsDTO> addFamilies(@RequestParam Long listId, @RequestBody List<String> codesToAdd) {
        if (codesToAdd == null || codesToAdd.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        return ResponseEntity.ok(savedListService.addFamilies(listId, codesToAdd));
    }

    @PutMapping("/removeFamilies")
    public ResponseEntity<SavedListDetailsDTO> removeFamilies(@RequestParam Long listId, @RequestBody List<String> codesToRemove) {
        if (codesToRemove == null || codesToRemove.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(savedListService.removeFamilies(listId, codesToRemove));
    }

    @PatchMapping("/updateList")
    public ResponseEntity<SavedListUpdateDTO> updateList(@RequestParam Long listId, @RequestBody SavedListUpdateDTO dto) {
        return ResponseEntity.ok(savedListService.updateList(listId, dto.name(), dto.description(), dto.campaign()));
    }

    @PatchMapping("/archiveList")
    public ResponseEntity<SavedListSummaryDTO> archiveList(@RequestParam Long listId) {
        return ResponseEntity.ok(savedListService.archiveList(listId));
    }

    @PutMapping("/toggleDone")
    public ResponseEntity<SavedListDoneToggleDTO> toggleFamilyDone(@RequestParam Long listId, @RequestParam Long familyId) {
        return ResponseEntity.ok(savedListService.toggleFamilyDone(listId, familyId));
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<SavedListDeleteDTO> deleteList(@RequestParam Long id) {
        return ResponseEntity.ok(savedListService.deleteList(id));
    }

    @GetMapping("/getCount")
    public ResponseEntity<Long> getSavedListCount() {
        return ResponseEntity.ok(savedListService.getSavedListsCount());
    }
}
