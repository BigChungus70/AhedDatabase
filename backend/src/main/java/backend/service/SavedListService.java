package backend.service;

import backend.model.DTO.*;
import backend.model.Family;
import backend.model.ListEntry;
import backend.model.SavedList;
import backend.model.enums.Campaign;
import backend.repository.FamilyRepository;
import backend.repository.SavedListRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class SavedListService {
    private final SavedListRepository listRepo;
    private final FamilyRepository familyRepo;

    @Transactional(readOnly = true)
    public SavedListDetailsDTO getDetails(Long listId) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));

        Integer doneCount = listRepo.doneFamiliesCount(listId);
        List<ListEntry> sortedEntries = list.getEntries().stream()
                .sorted(Comparator.comparing(e -> e.getFamily().getId()))
                .toList();
        return new SavedListDetailsDTO(
                list.getId(),
                list.getName(),
                list.getDescription(),
                list.isArchived(),
                list.getCreatedDate(),
                list.getLastModified(),
                doneCount,
                sortedEntries,
                list.getCampaign()
        );
    }

    @Transactional(readOnly = true)
    public SavedListSummaryDTO getSummary(Long listId) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));

        Integer familiesCount = listRepo.familiesCount(listId);
        Integer doneCount = listRepo.doneFamiliesCount(listId);


        return new SavedListSummaryDTO(
                list.getId(),
                list.getName(),
                list.getDescription(),
                familiesCount,
                list.isArchived(),
                list.getCreatedDate(),
                list.getLastModified(),
                doneCount,
                list.getCampaign()
        );
    }

    public SavedListDetailsDTO createList(String name,
                                          String description,
                                          Campaign campaign,
                                          List<String> codes) {
        SavedList list = new SavedList();
        list.setName(name);
        list.setDescription(description);
        list.setCampaign(campaign);
        list.setArchived(false);
        list.setCreatedDate(LocalDate.now());
        list.setLastModified(LocalDateTime.now());

        if (codes != null && !codes.isEmpty()) {
            List<Family> families = familyRepo.findByCodeIn(codes)
                    .orElseThrow(() -> new EntityNotFoundException("Some families not found"));

            for (Family f : families) {
                ListEntry e = new ListEntry();
                e.setSavedList(list);
                e.setFamily(f);
                e.setDone(false);
                e.setNotes(null);
                list.getEntries().add(e);
            }
        }
        listRepo.save(list);
        return getDetails(list.getId());
    }


    public SavedListDetailsDTO getFamiliesForList(Long listId) {
        return getDetails(listId);
    }

    public Map<String,String> getCampaigns() {
        return Campaign.asMap();
    }

    @Transactional
    public SavedListUpdateNotesDTO updateNotes(Long entryId, SavedListUpdateNotesDTO updateNotesDTO) {
        ListEntry entry = listRepo.findEntryById(entryId)
                .orElseThrow(() -> new EntityNotFoundException("Entry Not Found"));
        if (!Objects.equals(entry.getNotes(), updateNotesDTO.newNotes())) {
            entry.setNotes(updateNotesDTO.newNotes());

        }
        return new SavedListUpdateNotesDTO(entry.getNotes());
    }

    public List<SavedListSummaryDTO> getSavedLists() {
        return listRepo.findAll().stream()
                .map(savedList -> getSummary(savedList.getId()))
                .sorted(Comparator.comparing(SavedListSummaryDTO::id))
                .toList();
    }

    public SavedListDetailsDTO addFamilies(Long listId, List<String> codesToAdd) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        if (list.isArchived())
            throw new IllegalStateException("Cannot modify an archived list");

        List<Family> families = familyRepo.findByCodeIn(codesToAdd)
                .orElseThrow(() -> new EntityNotFoundException("Some families not found"));

        Set<String> existingCodes = list.getEntries()
                .stream()
                .map(e -> e.getFamily().getCode())
                .collect(Collectors.toSet());

        for (Family f : families) {
            if (!existingCodes.contains(f.getCode())) {
                ListEntry e = new ListEntry();
                e.setSavedList(list);
                e.setFamily(f);
                e.setDone(false);
                list.getEntries().add(e);
            }
        }
        list.setLastModified(LocalDateTime.now());
        return getDetails(listId);
    }

    public SavedListDetailsDTO removeFamilies(Long listId, List<String> codesToRemove) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        if (list.isArchived())
            throw new IllegalStateException("Cannot modify an archived list");

        list.getEntries()
                .removeIf(e -> codesToRemove.contains(e.getFamily().getCode()));
        list.setLastModified(LocalDateTime.now());
        return getDetails(listId);
    }

    public SavedListUpdateDTO updateList(Long listId, String name, String description, Campaign campaign) {
        SavedList list = listRepo.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        if (list.isArchived())
            throw new IllegalStateException("Cannot modify an archived list");

        if (name != null && !name.equals(list.getName()))
            list.setName(name);
        if (description != null && !description.equals(list.getDescription()))
            list.setDescription(description);
        if (campaign != null)
            list.setCampaign(campaign);

        list.setLastModified(LocalDateTime.now());
        return new SavedListUpdateDTO(list.getName(), list.getDescription(), list.getCampaign());
    }

    public SavedListSummaryDTO archiveList(Long id) {
        SavedList list = listRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        list.setArchived(true);
        list.setLastModified(LocalDateTime.now());

        return getSummary(list.getId());
    }


    public SavedListDoneToggleDTO toggleFamilyDone(Long listId, Long familyId) {
        ListEntry entry = listRepo.findEntryByListAndFamilyId(listId, familyId)
                .orElseThrow(() -> new EntityNotFoundException("Family not in list"));

        if (entry.getSavedList().isArchived())
            throw new IllegalStateException("Cannot modify an archived list");

        entry.setDone(!entry.isDone());
        entry.getSavedList().setLastModified(LocalDateTime.now());
        return new SavedListDoneToggleDTO(familyId, entry.isDone());
    }

    // only admin can access
    public SavedListDeleteDTO deleteList(Long id) {
        SavedList list = listRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        listRepo.delete(list);
        return new SavedListDeleteDTO(list.getId(), list.getName());
    }

    public Long getSavedListsCount() {
        return listRepo.getAllSavedListCount();
    }

}
