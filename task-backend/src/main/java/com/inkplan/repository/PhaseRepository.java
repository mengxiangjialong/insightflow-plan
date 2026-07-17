package com.inkplan.repository;
import com.inkplan.domain.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PhaseRepository extends JpaRepository<Phase, String> {
    List<Phase> findByPlanIdOrderByIndexAsc(String planId);
}
