package com.example.projetoCT.service;

import com.example.projetoCT.dto.AuthLoginRequest;
import com.example.projetoCT.dto.AuthLoginResponse;
import com.example.projetoCT.entity.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;

    public AuthLoginResponse login(AuthLoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.login(), request.senha())
        );

        Usuario usuario = usuarioService.buscarPorLogin(request.login());
        return new AuthLoginResponse("Login realizado com sucesso.", usuarioService.toResponse(usuario));
    }
}
