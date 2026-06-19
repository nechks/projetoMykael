package com.example.projetoCT.repository;

import com.example.projetoCT.entity.Usuario;
import com.example.projetoCT.enums.PerfilUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByLogin(String login);

    List<Usuario> findByPerfil(PerfilUsuario perfil);

    boolean existsByLogin(String login);
}
