package backend.model.DTO;

import backend.model.enums.Campaign;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SavedListSummaryDTO(
        Long id,
        String name,
        String description,
        String report,
        int familyCount,
        boolean archived,
        LocalDate createdDate,
        LocalDateTime lastModified,
        Integer doneCount,
        Campaign campaign

) {
}
