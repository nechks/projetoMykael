package com.example.projetoCT.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record RegistroAulaRequest(
        @NotNull LocalDate dataAula,
        @NotNull Long cronogramaId,
        @NotBlank String resumo,
        String observacoes
) {
}
