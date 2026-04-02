package backend.model.DTO;

import backend.model.Family;
import backend.model.ListEntry;
import backend.model.SavedList;
import backend.model.enums.Campaign;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record SavedListDetailsDTO(
        Long id,
        String name,
        String description,
        String report,
        boolean archived,
        LocalDate createdDate,
        LocalDateTime lastModified,
        Integer doneCount,
        List<ListEntry> entries,
        Campaign campaign
) {

}