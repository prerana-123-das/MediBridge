package com.medibridge.core.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation that adapts our Patient, Doctor, and Admin entities
 * to the Spring Security standard.
 */
public class CustomUserDetails implements UserDetails {

    private String username; // This will map to email or username
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean active;

    // Factory method for Admin
    public static CustomUserDetails buildAdmin(com.medibridge.core.model.Admin admin) {
        CustomUserDetails user = new CustomUserDetails();
        user.username = admin.getEmail();
        user.password = admin.getPasswordHash();
        user.authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        user.active = true;
        return user;
    }

    // Factory method for Doctor
    public static CustomUserDetails buildDoctor(com.medibridge.core.model.Doctor doctor) {
        CustomUserDetails user = new CustomUserDetails();
        user.username = doctor.getEmail();
        user.password = doctor.getPasswordHash();
        user.authorities = List.of(new SimpleGrantedAuthority("ROLE_DOCTOR"));
        user.active = doctor.getStatus() == com.medibridge.core.model.Doctor.Status.active;
        return user;
    }

    // Factory method for Patient
    public static CustomUserDetails buildPatient(com.medibridge.core.model.Patient patient) {
        CustomUserDetails user = new CustomUserDetails();
        user.username = patient.getEmail();
        user.password = patient.getPasswordHash();
        user.authorities = List.of(new SimpleGrantedAuthority("ROLE_PATIENT"));
        user.active = patient.getStatus() == com.medibridge.core.model.Patient.Status.active;
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
