package backend.repository;

import backend.model.JWT;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface JWTRepository extends JpaRepository<JWT, Long> {

    Optional<JWT> findByToken(String token);

    @Modifying
    @Query("DELETE FROM JWT rt WHERE rt.token = :token")
    void deleteByToken(String token);

    @Modifying
    @Query("DELETE FROM JWT rt WHERE rt.expiresAt < :now")
    void deleteAllExpired(Instant now);
}