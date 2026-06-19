package com.example.projetoCT.service;

import com.example.projetoCT.dto.UsuarioRequest;
import com.example.projetoCT.dto.UsuarioResponse;
import com.example.projetoCT.entity.Usuario;
import com.example.projetoCT.exception.RecursoNaoEncontradoException;
import com.example.projetoCT.exception.RegraNegocioException;
import com.example.projetoCT.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario buscarPorLogin(String login) {
        return usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado."));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (usuarioRepository.existsByLogin(request.login())) {
            throw new RegraNegocioException("Ja existe usuario com este login.");
        }

        Usuario usuario = Usuario.builder()
                .nome(request.nome())
                .login(request.login())
                .senha(passwordEncoder.encode(request.senha()))
                .perfil(request.perfil())
                .build();

        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getLogin(),
                usuario.getPerfil()
        );
    }
}
