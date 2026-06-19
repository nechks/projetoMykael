package com.example.projetoCT.repository;

import com.example.projetoCT.entity.RegistroAula;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroAulaRepository extends JpaRepository<RegistroAula, Long> {

    List<RegistroAula> findByDataAulaBetweenOrderByDataAulaAscModalidadeAsc(
            LocalDate inicio,
            LocalDate fim
    );
}
