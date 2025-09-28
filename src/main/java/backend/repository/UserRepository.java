package backend.repository;

import backend.model.UserAhed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserAhed, Long> {
    Optional<UserAhed> findByUsername(String username);

    @Query("SELECT u.enabled FROM UserAhed u WHERE u.username = :username")
    Boolean isEnabled(String username);


    @Query("SELECT u.id FROM UserAhed u")
    List<Long> findAllUserIds();

}
