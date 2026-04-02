package backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
public class UnverifiedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String token;

    private LocalDateTime createdAt;

    @Column
    private String registrationIp;

    @Column
    private String registrationCountry;

    @Column
    private String registrationRegion;

    @Column
    private String registrationCity;
}