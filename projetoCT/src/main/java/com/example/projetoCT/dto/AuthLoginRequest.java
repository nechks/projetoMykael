package com.example.projetoCT.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
        @NotBlank String login,
        @NotBlank String senha
) {
}
