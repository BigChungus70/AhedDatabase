package backend.model.DTO;

import backend.model.enums.Campaign;

public record SavedListUpdateDTO(String name, String description, Campaign campaign) {
}
