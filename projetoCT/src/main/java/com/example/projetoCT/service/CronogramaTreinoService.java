package com.example.projetoCT.service;

import com.example.projetoCT.dto.CronogramaTreinoRequest;
import com.example.projetoCT.dto.CronogramaTreinoResponse;
import com.example.projetoCT.dto.UsuarioResponse;
import com.example.projetoCT.entity.CronogramaTreino;
import com.example.projetoCT.entity.Usuario;
import com.example.projetoCT.enums.DiaSemana;
import com.example.projetoCT.enums.PerfilUsuario;
import com.example.projetoCT.exception.RecursoNaoEncontradoException;
import com.example.projetoCT.exception.RegraNegocioException;
import com.example.projetoCT.repository.CronogramaTreinoRepository;
import com.example.projetoCT.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CronogramaTreinoService {

    private final CronogramaTreinoRepository cronogramaTreinoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public CronogramaTreinoResponse criar(CronogramaTreinoRequest request) {
        validarCronogramaAtivoDuplicado(request, null);
        Usuario professor = buscarProfessor(request.professorId());

        CronogramaTreino cronograma = CronogramaTreino.builder()
                .diaSemana(request.diaSemana())
                .modalidade(request.modalidade())
                .professor(professor)
                .pilar(request.pilar())
                .descricao(request.descricao())
                .ativo(request.ativo() == null ? true : request.ativo())
                .build();

        return toResponse(cronogramaTreinoRepository.save(cronograma));
    }

    @Transactional(readOnly = true)
    public List<CronogramaTreinoResponse> listar() {
        return cronogramaTreinoRepository.findByAtivoTrueOrderByDiaSemanaAscModalidadeAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CronogramaTreinoResponse> listarHoje() {
        DiaSemana hoje = DiaSemana.fromDayOfWeek(LocalDate.now().getDayOfWeek());
        return cronogramaTreinoRepository.findByDiaSemanaAndAtivoTrueOrderByModalidadeAsc(hoje)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CronogramaTreinoResponse buscarPorId(Long id) {
        return toResponse(buscarEntidadePorId(id));
    }

    @Transactional
    public CronogramaTreinoResponse atualizar(Long id, CronogramaTreinoRequest request) {
        CronogramaTreino cronograma = buscarEntidadePorId(id);
        validarCronogramaAtivoDuplicado(request, id);
        Usuario professor = buscarProfessor(request.professorId());

        cronograma.setDiaSemana(request.diaSemana());
        cronograma.setModalidade(request.modalidade());
        cronograma.setProfessor(professor);
        cronograma.setPilar(request.pilar());
        cronograma.setDescricao(request.descricao());
        cronograma.setAtivo(request.ativo() == null ? true : request.ativo());

        return toResponse(cronogramaTreinoRepository.save(cronograma));
    }

    @Transactional
    public void excluir(Long id) {
        CronogramaTreino cronograma = buscarEntidadePorId(id);
        cronogramaTreinoRepository.delete(cronograma);
    }

    private CronogramaTreino buscarEntidadePorId(Long id) {
        return cronogramaTreinoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cronograma nao encontrado."));
    }

    private Usuario buscarProfessor(Long professorId) {
        Usuario professor = usuarioRepository.findById(professorId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Professor nao encontrado."));

        if (professor.getPerfil() != PerfilUsuario.INSTRUTOR) {
            throw new RegraNegocioException("O professor do cronograma precisa ter perfil INSTRUTOR.");
        }

        return professor;
    }

    private void validarCronogramaAtivoDuplicado(CronogramaTreinoRequest request, Long id) {
        boolean ativo = request.ativo() == null || request.ativo();

        if (!ativo) {
            return;
        }

        boolean duplicado = id == null
                ? cronogramaTreinoRepository.existsByDiaSemanaAndModalidadeAndAtivoTrue(
                        request.diaSemana(),
                        request.modalidade()
                )
                : cronogramaTreinoRepository.existsByDiaSemanaAndModalidadeAndAtivoTrueAndIdNot(
                        request.diaSemana(),
                        request.modalidade(),
                        id
                );

        if (duplicado) {
            throw new RegraNegocioException("Ja existe cronograma ativo para este dia e modalidade.");
        }
    }

    private CronogramaTreinoResponse toResponse(CronogramaTreino cronograma) {
        return new CronogramaTreinoResponse(
                cronograma.getId(),
                cronograma.getDiaSemana(),
                cronograma.getModalidade(),
                new UsuarioResponse(
                        cronograma.getProfessor().getId(),
                        cronograma.getProfessor().getNome(),
                        cronograma.getProfessor().getLogin(),
                        cronograma.getProfessor().getPerfil()
                ),
                cronograma.getPilar(),
                cronograma.getDescricao(),
                cronograma.getAtivo(),
                cronograma.getCriadoEm(),
                cronograma.getAtualizadoEm()
        );
    }
}
