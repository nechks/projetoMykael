package com.example.projetoCT.dto;

import com.example.projetoCT.enums.DiaSemana;
import com.example.projetoCT.enums.Modalidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CronogramaTreinoRequest(
        @NotNull DiaSemana diaSemana,
        @NotNull Modalidade modalidade,
        @NotNull Long professorId,
        @NotBlank String pilar,
        String descricao,
        Boolean ativo
) {
}
