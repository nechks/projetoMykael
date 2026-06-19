package com.example.projetoCT.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/h2-console/**", "/zap-lab/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/aulas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/aulas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/aulas/**").hasAnyRole("ADMIN", "INSTRUTOR")
                        .requestMatchers(HttpMethod.POST, "/api/cronogramas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cronogramas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cronogramas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cronogramas/**").hasAnyRole("ADMIN", "INSTRUTOR")
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                escreverErro(response, 401, "Nao autorizado", "Autenticacao obrigatoria.")
                        )
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                escreverErro(response, 403, "Acesso negado", "Usuario sem permissao para esta operacao.")
                        )
                )
                .authenticationProvider(authenticationProvider())
                .build();
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private void escreverErro(HttpServletResponse response, int status, String erro, String mensagem) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
                {"status":%d,"erro":"%s","mensagem":"%s"}
                """.formatted(status, erro, mensagem));
    }
}
