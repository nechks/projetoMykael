package com.example.projetoCT.dto;

public record AuthLoginResponse(
        String mensagem,
        UsuarioResponse usuario
) {
}
