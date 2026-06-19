package com.example.projetoCT.dto;

import com.example.projetoCT.enums.PerfilUsuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String login,
        PerfilUsuario perfil
) {
}
