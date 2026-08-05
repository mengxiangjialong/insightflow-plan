package com.inkplan.repository;
import com.inkplan.domain.StudyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
public interface StudyRecordRepository extends JpaRepository<StudyRecord, String> {
    List<StudyRecord> findByUserIdAndStudyDateBetweenOrderByStudyDateAsc(Long userId, LocalDate from, LocalDate to);
    List<StudyRecord> findByUserIdAndStudyDate(Long userId, LocalDate date);

    @Query("select count(distinct r.userId) from StudyRecord r where r.studyDate >= :since")
    long countActiveUsersSince(@Param("since") LocalDate since);
}
