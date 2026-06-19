package com.example.projetoCT.service;

import com.example.projetoCT.dto.RegistroAulaRequest;
import com.example.projetoCT.dto.RegistroAulaResponse;
import com.example.projetoCT.dto.UsuarioResponse;
import com.example.projetoCT.entity.CronogramaTreino;
import com.example.projetoCT.entity.RegistroAula;
import com.example.projetoCT.exception.RecursoNaoEncontradoException;
import com.example.projetoCT.repository.CronogramaTreinoRepository;
import com.example.projetoCT.repository.RegistroAulaRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistroAulaService {

    private final RegistroAulaRepository registroAulaRepository;
    private final CronogramaTreinoRepository cronogramaTreinoRepository;

    @Transactional
    public RegistroAulaResponse criar(RegistroAulaRequest request) {
        CronogramaTreino cronograma = cronogramaTreinoRepository.findById(request.cronogramaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cronograma nao encontrado."));

        RegistroAula registro = RegistroAula.builder()
                .dataAula(request.dataAula())
                .cronogramaTreino(cronograma)
                .professor(cronograma.getProfessor())
                .modalidade(cronograma.getModalidade())
                .pilar(cronograma.getPilar())
                .resumo(request.resumo().trim())
                .observacoes(normalizarTextoOpcional(request.observacoes()))
                .build();

        return toResponse(registroAulaRepository.save(registro));
    }

    @Transactional(readOnly = true)
    public List<RegistroAulaResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return registroAulaRepository.findByDataAulaBetweenOrderByDataAulaAscModalidadeAsc(inicio, fim)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RegistroAulaResponse> listarPorSemana(LocalDate inicio) {
        return listarPorPeriodo(inicio, inicio.plusDays(6));
    }

    @Transactional(readOnly = true)
    public List<RegistroAulaResponse> listarPorMes(int ano, int mes) {
        YearMonth yearMonth = YearMonth.of(ano, mes);
        return listarPorPeriodo(yearMonth.atDay(1), yearMonth.atEndOfMonth());
    }

    @Transactional
    public void excluir(Long id) {
        RegistroAula registro = registroAulaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de aula nao encontrado."));

        registroAulaRepository.delete(registro);
    }

    private String normalizarTextoOpcional(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }

    private RegistroAulaResponse toResponse(RegistroAula registro) {
        return new RegistroAulaResponse(
                registro.getId(),
                registro.getDataAula(),
                registro.getCronogramaTreino().getId(),
                new UsuarioResponse(
                        registro.getProfessor().getId(),
                        registro.getProfessor().getNome(),
                        registro.getProfessor().getLogin(),
                        registro.getProfessor().getPerfil()
                ),
                registro.getModalidade(),
                registro.getPilar(),
                registro.getResumo(),
                registro.getObservacoes(),
                registro.getCriadoEm()
        );
    }
}
