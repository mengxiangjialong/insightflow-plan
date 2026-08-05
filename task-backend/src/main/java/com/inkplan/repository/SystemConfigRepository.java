package com.inkplan.repository;
import com.inkplan.domain.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
    Optional<SystemConfig> findByConfigKey(String configKey);
}
