package com.medibridge.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filter that intercepts all incoming requests to validate the JWT in the Authorization header.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Extract token from standard "Bearer <token>" format
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (io.jsonwebtoken.MalformedJwtException e) {
                logger.warn("Invalid JWT format detected (likely mock token remaining in local storage)");
            } catch (Exception e) {
                logger.error("Error extracting username from JWT: " + e.getMessage());
            }
        }

        // If username is extracted and SecurityContext is currently empty, validate and set the authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.customUserDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Use the role stored in the JWT token rather than the one from UserDetailsService,
                // because UserDetailsService resolves role by checking tables in order (patient -> doctor -> admin)
                // and can assign the wrong role if a user exists in multiple tables.
                String jwtRole = null;
                try {
                    jwtRole = jwtUtil.extractRole(jwt);
                } catch (Exception e) {
                    logger.warn("Could not extract role from JWT, falling back to UserDetails role");
                }

                var authorities = (jwtRole != null && !jwtRole.isEmpty())
                        ? List.of(new SimpleGrantedAuthority(jwtRole))
                        : userDetails.getAuthorities();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set the user in the security context for the duration of the request
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}

