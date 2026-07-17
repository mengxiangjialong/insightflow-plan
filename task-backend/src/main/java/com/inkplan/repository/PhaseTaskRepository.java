package com.inkplan.repository;
import com.inkplan.domain.PhaseTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PhaseTaskRepository extends JpaRepository<PhaseTask, String> {
    List<PhaseTask> findByPhaseId(String phaseId);
}
