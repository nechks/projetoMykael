package com.example.projetoCT.controller;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Profile("zap-lab")
@RestController
@RequestMapping("/zap-lab")
@RequiredArgsConstructor
public class ZapLabController {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    void criarDadosDoLaboratorio() {
        jdbcTemplate.execute("""
                create table if not exists zap_lab_items (
                    id int primary key,
                    nome varchar(100) not null
                )
                """);
        jdbcTemplate.update("merge into zap_lab_items key(id) values (1, 'Cronograma publico')");
        jdbcTemplate.update("merge into zap_lab_items key(id) values (2, 'Registro de aula')");
    }

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    String index(HttpServletResponse response) {
        response.addHeader("Set-Cookie", "zap_lab_session=12345; Path=/");
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>ZAP Lab - Vulnerabilidades intencionais</title>
                </head>
                <body>
                    <h1>ZAP Lab</h1>
                    <p>Endpoints vulneraveis apenas para treino local com OWASP ZAP.</p>

                    <h2>XSS refletido</h2>
                    <form action="/zap-lab/reflected-xss" method="get">
                        <input name="q" value="teste">
                        <button type="submit">Testar XSS</button>
                    </form>
                    <p><a href="/zap-lab/reflected-xss?q=teste">Abrir exemplo de XSS</a></p>

                    <h2>SQL injection</h2>
                    <form action="/zap-lab/sql-injection" method="get">
                        <input name="id" value="1">
                        <button type="submit">Buscar item</button>
                    </form>
                    <p><a href="/zap-lab/sql-injection?id=1">Abrir exemplo de SQLi</a></p>
                </body>
                </html>
                """;
    }

    @GetMapping(value = "/reflected-xss", produces = MediaType.TEXT_HTML_VALUE)
    String reflectedXss(@RequestParam(defaultValue = "") String q) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>Busca vulneravel</title>
                </head>
                <body>
                    <h1>Resultado da busca</h1>
                    <p>Voce pesquisou por: %s</p>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(q);
    }

    @GetMapping(value = "/sql-injection", produces = MediaType.TEXT_HTML_VALUE)
    String sqlInjection(@RequestParam(defaultValue = "1") String id) {
        String sql = "select nome from zap_lab_items where id = " + id;
        List<String> nomes = jdbcTemplate.queryForList(sql, String.class);
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>Consulta vulneravel</title>
                </head>
                <body>
                    <h1>Itens encontrados</h1>
                    <p>SQL executado: %s</p>
                    <ul>%s</ul>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(sql, nomes.stream().map(nome -> "<li>" + nome + "</li>").reduce("", String::concat));
    }
}
