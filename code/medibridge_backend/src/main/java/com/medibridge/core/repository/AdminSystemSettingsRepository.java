package com.medibridge.core.repository;

import com.medibridge.core.model.AdminSystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminSystemSettingsRepository extends JpaRepository<AdminSystemSettings, Integer> {
}

