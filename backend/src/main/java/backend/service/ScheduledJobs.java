package backend.service;

import backend.repository.JWTRepository;
import backend.repository.PendingUserRepository;
import backend.repository.UnverifiedUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ScheduledJobs {

    private final JWTRepository JWTRepository;
    private final PendingUserRepository pendingRepo;
    private final UnverifiedUserRepository unverifiedRepo;


    @Scheduled(cron = "0 0 */6 * * *")
    @Transactional
    public void deleteExpiredPendingUsers() {
        pendingRepo.deleteAllByCreatedAtBefore(LocalDateTime.now().minusDays(2));
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteExpiredTokens() {
        JWTRepository.deleteAllExpired(Instant.now());
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deleteExpiredUnverifiedRegistrations() {
        unverifiedRepo.deleteAllByCreatedAtBefore(LocalDateTime.now().minusMinutes(15));
    }
}