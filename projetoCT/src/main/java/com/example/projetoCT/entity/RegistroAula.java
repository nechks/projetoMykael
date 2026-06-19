package com.example.projetoCT.entity;

import com.example.projetoCT.enums.Modalidade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "registros_aula")
public class RegistroAula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate dataAula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cronograma_id", nullable = false)
    private CronogramaTreino cronogramaTreino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private Usuario professor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Modalidade modalidade;

    @Column(nullable = false)
    private String pilar;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String resumo;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() {
        criadoEm = LocalDateTime.now();
    }
}
