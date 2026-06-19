package com.example.projetoCT.exception;

import com.example.projetoCT.dto.ErroResponse;
import java.nio.file.AccessDeniedException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> recursoNaoEncontrado(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.simples(404, "Recurso nao encontrado", ex.getMessage()));
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResponse.simples(400, "Regra de negocio", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                campos.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResponse.validacao(400, "Validacao", "Existem campos invalidos.", campos));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> credenciaisInvalidas() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErroResponse.simples(401, "Nao autorizado", "Login ou senha invalidos."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> jsonInvalido() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResponse.simples(400, "JSON invalido", "Verifique o corpo da requisicao."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> acessoNegado() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErroResponse.simples(403, "Acesso negado", "Usuario sem permissao para esta operacao."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> erroInterno() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErroResponse.simples(500, "Erro interno", "Ocorreu um erro inesperado."));
    }
}
