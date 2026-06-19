package com.example.projetoCT.dto;

import com.example.projetoCT.enums.PerfilUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequest(
        @NotBlank String nome,
        @NotBlank String login,
        @NotBlank String senha,
        @NotNull PerfilUsuario perfil
) {
}
