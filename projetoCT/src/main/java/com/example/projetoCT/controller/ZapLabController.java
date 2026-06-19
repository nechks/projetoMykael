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

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Profile("zap-lab")
@RestController
@RequestMapping("/zap-lab")
@RequiredArgsConstructor
public class ZapLabController {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

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

                    <h2>Command injection</h2>
                    <form action="/zap-lab/command-injection" method="get">
                        <input name="host" value="localhost">
                        <button type="submit">Executar ping</button>
                    </form>
                    <p><a href="/zap-lab/command-injection?host=localhost">Abrir exemplo de command injection</a></p>

                    <h2>Path traversal</h2>
                    <form action="/zap-lab/path-traversal" method="get">
                        <input name="file" value="pom.xml">
                        <button type="submit">Ler arquivo</button>
                    </form>
                    <p><a href="/zap-lab/path-traversal?file=pom.xml">Abrir exemplo de path traversal</a></p>
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
        List<String> nomes = new ArrayList<>();

        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql)) {
            while (resultSet.next()) {
                nomes.add(resultSet.getString("nome"));
            }
        } catch (Exception exception) {
            return htmlErro("Erro na consulta SQL", "SQL executado: " + sql, exception.getMessage());
        }

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

    @GetMapping(value = "/command-injection", produces = MediaType.TEXT_HTML_VALUE)
    String commandInjection(@RequestParam(defaultValue = "localhost") String host) {
        String command = "cmd.exe /c ping -n 1 " + host;
        StringBuilder output = new StringBuilder();

        try {
            Process process = Runtime.getRuntime().exec(command);
            process.waitFor();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
        } catch (Exception exception) {
            return htmlErro("Erro ao executar comando", "Comando executado: " + command, exception.getMessage());
        }

        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>Comando vulneravel</title>
                </head>
                <body>
                    <h1>Resultado do comando</h1>
                    <p>Comando executado: %s</p>
                    <pre>%s</pre>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(command, output);
    }

    @GetMapping(value = "/command-injection-linux", produces = MediaType.TEXT_HTML_VALUE)
    String commandInjectionLinux(@RequestParam(defaultValue = "localhost") String host) {
        String command = "sh -c ping -c 1 " + host;
        StringBuilder output = new StringBuilder();

        try {
            Process process = Runtime.getRuntime().exec(command);
            process.waitFor();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
        } catch (Exception exception) {
            return htmlErro("Erro ao executar comando Linux", "Comando executado: " + command, exception.getMessage());
        }

        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>Comando vulneravel</title>
                </head>
                <body>
                    <h1>Resultado do comando Linux</h1>
                    <p>Comando executado: %s</p>
                    <pre>%s</pre>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(command, output);
    }

    @GetMapping(value = "/path-traversal", produces = MediaType.TEXT_HTML_VALUE)
    String pathTraversal(@RequestParam(defaultValue = "pom.xml") String file) {
        Path requestedFile = Path.of(file);
        String content;

        try {
            content = Files.readString(requestedFile);
        } catch (Exception exception) {
            return htmlErro("Erro ao ler arquivo", "Caminho solicitado: " + requestedFile, exception.getMessage());
        }

        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>Leitura vulneravel</title>
                </head>
                <body>
                    <h1>Arquivo lido</h1>
                    <p>Caminho solicitado: %s</p>
                    <pre>%s</pre>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(requestedFile, content);
    }

    private String htmlErro(String titulo, String detalhe, String mensagem) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>%s</title>
                </head>
                <body>
                    <h1>%s</h1>
                    <p>%s</p>
                    <pre>%s</pre>
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(titulo, titulo, detalhe, mensagem);
    }
}
