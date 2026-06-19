package com.example.projetoCT.dto;

import com.example.projetoCT.enums.Modalidade;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RegistroAulaResponse(
        Long id,
        LocalDate dataAula,
        Long cronogramaId,
        UsuarioResponse professor,
        Modalidade modalidade,
        String pilar,
        String resumo,
        String observacoes,
        LocalDateTime criadoEm
) {
}
