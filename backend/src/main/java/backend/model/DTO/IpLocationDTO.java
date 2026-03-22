package backend.model.DTO;

public record IpLocationDTO(
        String country,
        String regionName,
        String city,
        String query,
        String status
) {}