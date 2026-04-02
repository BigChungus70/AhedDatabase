package backend.model.admin;

import backend.model.enums.UserRole;

import java.time.LocalDateTime;

public record AdminResponseDTO(
        Long id,
        String username,
        String email,
        UserRole role,
        Boolean enabled,
        Boolean slot,
        LocalDateTime lastAccess) { }
