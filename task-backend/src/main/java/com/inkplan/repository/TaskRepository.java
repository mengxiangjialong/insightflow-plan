package com.inkplan.repository;
import com.inkplan.domain.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface TaskRepository extends JpaRepository<TaskEntity, String> {
    List<TaskEntity> findByUserIdAndTaskDate(Long userId, LocalDate date);
}
