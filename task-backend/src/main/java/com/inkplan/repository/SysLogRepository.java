package com.inkplan.repository;
import com.inkplan.domain.SysLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SysLogRepository extends JpaRepository<SysLog, String> {
    List<SysLog> findTop200ByOrderByCreatedAtDesc();
}
