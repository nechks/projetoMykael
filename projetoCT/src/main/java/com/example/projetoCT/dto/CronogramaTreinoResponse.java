package com.example.projetoCT.dto;

import com.example.projetoCT.enums.DiaSemana;
import com.example.projetoCT.enums.Modalidade;
import java.time.LocalDateTime;

public record CronogramaTreinoResponse(
        Long id,
        DiaSemana diaSemana,
        Modalidade modalidade,
        UsuarioResponse professor,
        String pilar,
        String descricao,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}
