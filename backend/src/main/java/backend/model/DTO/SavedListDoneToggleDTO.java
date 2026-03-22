package backend.model.DTO;

public record SavedListDoneToggleDTO(
        Long familyId,
        boolean done
) {}
