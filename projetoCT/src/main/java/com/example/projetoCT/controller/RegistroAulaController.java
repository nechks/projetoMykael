package com.example.projetoCT.controller;

import com.example.projetoCT.dto.RegistroAulaRequest;
import com.example.projetoCT.dto.RegistroAulaResponse;
import com.example.projetoCT.service.RegistroAulaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/aulas")
@RequiredArgsConstructor
public class RegistroAulaController {

    private final RegistroAulaService registroAulaService;

    @PostMapping
    public ResponseEntity<RegistroAulaResponse> criar(@Valid @RequestBody RegistroAulaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registroAulaService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<RegistroAulaResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        return ResponseEntity.ok(registroAulaService.listarPorPeriodo(inicio, fim));
    }

    @GetMapping("/semana")
    public ResponseEntity<List<RegistroAulaResponse>> listarPorSemana(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio
    ) {
        return ResponseEntity.ok(registroAulaService.listarPorSemana(inicio));
    }

    @GetMapping("/mes")
    public ResponseEntity<List<RegistroAulaResponse>> listarPorMes(
            @RequestParam int ano,
            @RequestParam int mes
    ) {
        return ResponseEntity.ok(registroAulaService.listarPorMes(ano, mes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        registroAulaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
