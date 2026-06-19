package com.example.projetoCT.repository;

import com.example.projetoCT.entity.CronogramaTreino;
import com.example.projetoCT.enums.DiaSemana;
import com.example.projetoCT.enums.Modalidade;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CronogramaTreinoRepository extends JpaRepository<CronogramaTreino, Long> {

    List<CronogramaTreino> findByAtivoTrueOrderByDiaSemanaAscModalidadeAsc();

    List<CronogramaTreino> findByDiaSemanaAndAtivoTrueOrderByModalidadeAsc(DiaSemana diaSemana);

    boolean existsByDiaSemanaAndModalidadeAndAtivoTrue(DiaSemana diaSemana, Modalidade modalidade);

    boolean existsByDiaSemanaAndModalidadeAndAtivoTrueAndIdNot(
            DiaSemana diaSemana,
            Modalidade modalidade,
            Long id
    );
}
