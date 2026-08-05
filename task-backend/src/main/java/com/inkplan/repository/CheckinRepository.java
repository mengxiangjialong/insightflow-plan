package com.inkplan.repository;
import com.inkplan.domain.Checkin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface CheckinRepository extends JpaRepository<Checkin, String> {
    Optional<Checkin> findByUserIdAndCheckinDate(Long userId, LocalDate date);
    List<Checkin> findByUserIdOrderByCheckinDateDesc(Long userId);
    long countByCheckinDate(LocalDate date);
}
