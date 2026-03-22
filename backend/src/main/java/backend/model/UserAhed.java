package backend.model;

import backend.model.enums.UserRole;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
public class UserAhed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    @Email
    private String email;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private LocalDateTime lastAccess;

    // admin can disable the user immediately
    private Boolean enabled;

}
