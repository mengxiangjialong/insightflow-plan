package com.inkplan.repository;
import com.inkplan.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PlanRepository extends JpaRepository<Plan, String> {
    List<Plan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
