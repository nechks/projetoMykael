package com.example.projetoCT.config;

import com.example.projetoCT.entity.Usuario;
import com.example.projetoCT.enums.PerfilUsuario;
import com.example.projetoCT.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner criarUsuariosIniciais() {
        return args -> {
            criarUsuarioSeNaoExistir("Administrador", "admin", "admin123", PerfilUsuario.ADMIN);
            criarUsuarioSeNaoExistir("Instrutor", "instrutor", "instrutor123", PerfilUsuario.INSTRUTOR);
        };
    }

    private void criarUsuarioSeNaoExistir(String nome, String login, String senha, PerfilUsuario perfil) {
        if (usuarioRepository.existsByLogin(login)) {
            return;
        }

        Usuario usuario = Usuario.builder()
                .nome(nome)
                .login(login)
                .senha(passwordEncoder.encode(senha))
                .perfil(perfil)
                .build();

        usuarioRepository.save(usuario);
    }
}
