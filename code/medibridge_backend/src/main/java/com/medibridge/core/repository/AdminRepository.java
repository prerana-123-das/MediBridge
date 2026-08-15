package com.medibridge.core.repository;

import com.medibridge.core.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    java.util.Optional<Admin> findByUsername(String username);
    java.util.Optional<Admin> findByEmail(String email);
}

