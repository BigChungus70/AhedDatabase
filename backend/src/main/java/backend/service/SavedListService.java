package backend.service;

import backend.config.SecurityUtils;
import backend.model.*;
import backend.model.DTO.*;
import backend.model.enums.Campaign;
import backend.model.enums.DataStatus;
import backend.model.enums.FamilyCondition;
import backend.model.enums.UserRole;
import backend.repository.ChildrenRepository;
import backend.repository.FamilyRepository;
import backend.repository.SavedListRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
    private final ChildrenRepository childrenRepo;

    @Transactional(readOnly = true)
    public SavedListDetailsDTO getDetails(Long listId) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List doesn't exist"));

        if (!SecurityUtils.getCurrentUserRole().hasAtLeast(UserRole.High) && list.isArchived()) {
            throw new AuthorizationDeniedException("Access Denied");
        }

        Integer doneCount = listRepo.doneFamiliesCount(listId);
        List<ListEntry> sortedEntries = list.getEntries().stream()
                .sorted(Comparator.comparing(e -> e.getFamily().getId()))
                .toList();
        return new SavedListDetailsDTO(
                list.getId(),
                list.getName(),
                list.getDescription(),
                list.getReport(),
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
                list.getReport(),
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


    public Map<String, String> getCampaigns() {
        return Campaign.asMap();
    }

    public byte[] exportList(Long listId, boolean residence, boolean children, Integer minDOB, Integer maxDOB) {
        SavedList list = listRepo.findWithEntriesById(listId)
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        if (list.isArchived()) {
            throw new IllegalArgumentException("List is archived");
        }

        List<ListEntry> entries = list.getEntries().stream()
                .sorted(Comparator.comparing(e -> e.getFamily().getId()))
                .toList();

        Map<Long, List<Children>> childrenByFamilyId = new HashMap<>();
        if (children) {
            List<Long> familyIds = entries.stream()
                    .map(e -> e.getFamily().getId())
                    .toList();
            if (!familyIds.isEmpty()) {
                childrenRepo.findByFamilyIds(familyIds).forEach(c ->
                        childrenByFamilyId.computeIfAbsent(c.getFamily().getId(), k -> new ArrayList<>()).add(c)
                );
            }
        }

        Map<FamilyCondition, String> conditionTranslation = new EnumMap<>(FamilyCondition.class);
        conditionTranslation.put(FamilyCondition.veryGood, "جيد جداً");
        conditionTranslation.put(FamilyCondition.good, "جيد");
        conditionTranslation.put(FamilyCondition.acceptable, "مقبول");
        conditionTranslation.put(FamilyCondition.bad, "سيئ");
        conditionTranslation.put(FamilyCondition.dontForget, "لا تنسى");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(list.getName());
            sheet.setRightToLeft(true);

            // header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // center style for plain cells
            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // wrap style for numbers, children, notes
            CellStyle wrapStyle = workbook.createCellStyle();
            wrapStyle.setWrapText(true);
            wrapStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // status color styles
            Map<DataStatus, CellStyle> statusStyles = new EnumMap<>(DataStatus.class);
            Map<DataStatus, IndexedColors> colorMap = new EnumMap<>(DataStatus.class);
            colorMap.put(DataStatus.ok, IndexedColors.WHITE);
            colorMap.put(DataStatus.archivedBlacklisted, IndexedColors.BLACK);
            colorMap.put(DataStatus.archivedLeft, IndexedColors.RED);
            colorMap.put(DataStatus.archivedDrawn, IndexedColors.LIGHT_BLUE);
            colorMap.put(DataStatus.unreachable, IndexedColors.YELLOW);
            colorMap.put(DataStatus.priority, IndexedColors.GREEN);
            colorMap.forEach((status, color) -> {
                CellStyle style = workbook.createCellStyle();
                style.setFillForegroundColor(color.getIndex());
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                style.setAlignment(HorizontalAlignment.CENTER);
                style.setVerticalAlignment(VerticalAlignment.CENTER);
                statusStyles.put(status, style);
            });

            // headers
            List<String> headers = new ArrayList<>(List.of("#", "الرمز", "الوالدين", "الحالة", "أرقام الهواتف"));
            if (residence) headers.add("العنوان");
            if (children) headers.add("الأطفال");
            headers.add("ملاحظات");
            int notesColIndex = headers.size() - 1;

            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(50);
            for (int i = 0; i < headers.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            // data rows
            int rowNum = 1;
            for (ListEntry entry : entries) {
                Family f = entry.getFamily();
                Row row = sheet.createRow(rowNum);
                row.setHeightInPoints(200);

                Cell numberCell = row.createCell(0);
                numberCell.setCellValue(rowNum);
                numberCell.setCellStyle(statusStyles.getOrDefault(f.getDataStatus(), statusStyles.get(DataStatus.ok)));

                Cell codeCell = row.createCell(1);
                codeCell.setCellValue(f.getCode() != null ? f.getCode() : "");
                codeCell.setCellStyle(centerStyle);

                Cell parentsCell = row.createCell(2);
                parentsCell.setCellValue(f.getParents() != null ? f.getParents() : "");
                parentsCell.setCellStyle(centerStyle);

                Cell conditionCell = row.createCell(3);
                conditionCell.setCellValue(f.getCondition() != null
                        ? conditionTranslation.getOrDefault(f.getCondition(), f.getCondition().name()) : "");
                conditionCell.setCellStyle(centerStyle);

                Cell numbersCell = row.createCell(4);
                numbersCell.setCellValue(f.getNumbers() != null ? f.getNumbers() : "");
                numbersCell.setCellStyle(wrapStyle);

                int optionalCol = 5;
                if (residence) {
                    Cell residenceCell = row.createCell(optionalCol++);
                    residenceCell.setCellValue(f.getAddress() != null ? f.getAddress() : "");
                    residenceCell.setCellStyle(centerStyle);
                }

                if (children) {
                    List<Children> familyChildren = childrenByFamilyId.getOrDefault(f.getId(), List.of());
                    String childrenStr = familyChildren.stream()
                            .filter(c -> (minDOB == null || c.getYearOfBirth() >= minDOB)
                                    && (maxDOB == null || c.getYearOfBirth() <= maxDOB))
                            .map(c -> c.getName() + ": " + c.getYearOfBirth())
                            .collect(Collectors.joining("\n"));
                    Cell childrenCell = row.createCell(optionalCol);
                    childrenCell.setCellValue(childrenStr);
                    childrenCell.setCellStyle(wrapStyle);
                }

                Cell notesCell = row.createCell(notesColIndex);
                notesCell.setCellValue(entry.getNotes() != null ? entry.getNotes() : "");
                notesCell.setCellStyle(wrapStyle);

                rowNum++;
            }

            // column sizing
            for (int i = 0; i < headers.size() - 1; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1024);
            }
            sheet.setColumnWidth(notesColIndex, Math.max(256 * 40, sheet.getColumnWidth(notesColIndex)));

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public SavedListUpdateReportDTO updateReport(Long listId, String report) {
        SavedList list = listRepo.findById(listId)
                .orElseThrow(() -> new IllegalArgumentException("List does not exist"));
        if(list.isArchived())
        {
            throw new IllegalArgumentException("List is archived");
        }
        list.setReport(report);
        listRepo.save(list);
        return new SavedListUpdateReportDTO(list.getReport());
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

    public List<SavedListSummaryDTO> getAllLists() {
        UserRole role = SecurityUtils.getCurrentUserRole();
        return listRepo.findAll().stream()
                .filter(l -> role.hasAtLeast(UserRole.High) || !l.isArchived())
                .map(savedList -> getSummary(savedList.getId()))
                .sorted(Comparator.comparing(SavedListSummaryDTO::id))
                .toList();
    }

    public SavedListDetailsDTO getList(Long listId) {
        return getDetails(listId);
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

    public Long getListCount() {
        return listRepo.getAllSavedListCount();
    }


}
