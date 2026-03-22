package backend.model.DTO;

import backend.model.enums.Campaign;

import java.util.List;

public record SavedListCreateDTO(String name, String description, Campaign campaign, List<String> familyCodes) {
}
