package backend.repository;

import backend.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser,Long> {

    Optional<PendingUser> findByUsername(String username);
    Optional<PendingUser> findByEmail(String email);
    @Query("SELECT p FROM PendingUser p WHERE p.token = :token")
    PendingUser findByToken(@Param("token") String token);

    void deleteAllByCreatedAtBefore(LocalDateTime cutoff);
}
