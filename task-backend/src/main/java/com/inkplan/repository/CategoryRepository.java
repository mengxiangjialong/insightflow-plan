package com.inkplan.repository;
import com.inkplan.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoryRepository extends JpaRepository<Category, String> {}
