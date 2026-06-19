package com.example.projetoCT.controller;

import com.example.projetoCT.dto.CronogramaTreinoRequest;
import com.example.projetoCT.dto.CronogramaTreinoResponse;
import com.example.projetoCT.service.CronogramaTreinoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cronogramas")
@RequiredArgsConstructor
public class CronogramaTreinoController {

    private final CronogramaTreinoService cronogramaTreinoService;

    @PostMapping
    public ResponseEntity<CronogramaTreinoResponse> criar(@Valid @RequestBody CronogramaTreinoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cronogramaTreinoService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<CronogramaTreinoResponse>> listar() {
        return ResponseEntity.ok(cronogramaTreinoService.listar());
    }

    @GetMapping("/hoje")
    public ResponseEntity<List<CronogramaTreinoResponse>> listarHoje() {
        return ResponseEntity.ok(cronogramaTreinoService.listarHoje());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CronogramaTreinoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cronogramaTreinoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CronogramaTreinoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody CronogramaTreinoRequest request
    ) {
        return ResponseEntity.ok(cronogramaTreinoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        cronogramaTreinoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
