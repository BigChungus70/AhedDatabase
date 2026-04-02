package backend.repository;


import backend.model.PendingUser;
import backend.model.UnverifiedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UnverifiedUserRepository extends JpaRepository<UnverifiedUser, Long> {

    Optional<UnverifiedUser> findByEmail(String email);
    Optional<UnverifiedUser> findByUsername(String username);


    UnverifiedUser findByToken(String token);

    void deleteAllByCreatedAtBefore(LocalDateTime cutoff);

}