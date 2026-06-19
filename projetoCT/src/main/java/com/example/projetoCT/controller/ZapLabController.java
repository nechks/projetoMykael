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
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Profile("zap-lab")
@RestController
@RequestMapping("/zap-lab")
@RequiredArgsConstructor
public class ZapLabController {

    static final String ARQUIVO_POM = "pom.xml";

    private static final Pattern HOST_SEGURO = Pattern.compile("^[a-zA-Z0-9.-]{1,253}$");
    private static final Map<String, Path> ARQUIVOS_PERMITIDOS = Map.of(
            ARQUIVO_POM, Path.of(ARQUIVO_POM),
            "application.yml", Path.of("src/main/resources/application.yml")
    );

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
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: o cookie agora tem protecoes para nao ser lido por scripts e reduzir abuso externo.
        response.addHeader("Set-Cookie", "zap_lab_session=12345; Path=/; HttpOnly; SameSite=Strict; Secure");

        return pagina("ZAP Lab - Vulnerabilidades corrigidas", """
                <h1>ZAP Lab</h1>
                <p>Endpoints usados no laboratorio, agora com correcoes aplicadas.</p>
                %s
                %s
                %s
                %s
                """.formatted(
                formulario("XSS refletido", "/zap-lab/reflected-xss", "q", "teste"),
                formulario("SQL injection", "/zap-lab/sql-injection", "id", "1"),
                formulario("Command injection", "/zap-lab/command-injection", "host", "localhost"),
                formulario("Path traversal", "/zap-lab/path-traversal", "file", ARQUIVO_POM)
        ));
    }

    @GetMapping(value = "/reflected-xss", produces = MediaType.TEXT_HTML_VALUE)
    String reflectedXss(@RequestParam(defaultValue = "") String q, HttpServletResponse response) {
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: antes o texto voltava direto para a pagina; agora ele e escapado.
        return pagina("Busca corrigida", """
                <h1>Resultado da busca</h1>
                <p>Voce pesquisou por: %s</p>
                """.formatted(escaparHtml(q)));
    }

    @GetMapping(value = "/sql-injection", produces = MediaType.TEXT_HTML_VALUE)
    String sqlInjection(@RequestParam(defaultValue = "1") String id, HttpServletResponse response) {
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: o valor nao entra mais no texto SQL; ele vai separado em parametro seguro.
        String sql = "select nome from zap_lab_items where id = ?";
        List<String> nomes = new ArrayList<>();
        int idNumerico = converterId(id);

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, idNumerico);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    nomes.add(resultSet.getString("nome"));
                }
            }
        } catch (Exception exception) {
            // Correcao: nao mostramos detalhes internos do banco para o usuario.
            return htmlErro("Erro na consulta SQL", "A consulta nao foi concluida.", "Erro interno.");
        }

        return pagina("Consulta corrigida", """
                <h1>Itens encontrados</h1>
                <p>SQL parametrizado: %s</p>
                <ul>%s</ul>
                """.formatted(escaparHtml(sql), nomes.stream()
                .map(nome -> "<li>" + escaparHtml(nome) + "</li>")
                .reduce("", String::concat)));
    }

    @GetMapping(value = "/command-injection", produces = MediaType.TEXT_HTML_VALUE)
    String commandInjection(@RequestParam(defaultValue = "localhost") String host, HttpServletResponse response) {
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: antes o sistema executava comando real; agora apenas valida e simula o resultado.
        return comandoSimulado(host, "ping -n 1 ");
    }

    @GetMapping(value = "/command-injection-linux", produces = MediaType.TEXT_HTML_VALUE)
    String commandInjectionLinux(@RequestParam(defaultValue = "localhost") String host, HttpServletResponse response) {
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: mesma protecao para Linux, sem executar comando no servidor.
        return comandoSimulado(host, "ping -c 1 ");
    }

    @GetMapping(value = "/path-traversal", produces = MediaType.TEXT_HTML_VALUE)
    String pathTraversal(@RequestParam(defaultValue = ARQUIVO_POM) String file, HttpServletResponse response) {
        aplicarCabecalhosDeSeguranca(response);
        // Correcao: antes qualquer caminho podia ser lido; agora so aceitamos nomes da lista permitida.
        Path requestedFile = ARQUIVOS_PERMITIDOS.get(file);

        if (requestedFile == null) {
            return htmlErro("Arquivo bloqueado", "O arquivo solicitado nao esta na lista permitida.", "Path traversal bloqueado.");
        }

        try {
            return pagina("Leitura corrigida", """
                    <h1>Arquivo lido</h1>
                    <p>Caminho solicitado: %s</p>
                    <pre>%s</pre>
                    """.formatted(escaparHtml(requestedFile.toString()), escaparHtml(Files.readString(requestedFile))));
        } catch (Exception exception) {
            return htmlErro("Erro ao ler arquivo", "Nao foi possivel abrir o arquivo solicitado.", "Erro interno.");
        }
    }

    private String comandoSimulado(String host, String prefixoComando) {
        if (!HOST_SEGURO.matcher(host).matches()) {
            return htmlErro("Host invalido", "O host informado foi rejeitado.", "Use apenas letras, numeros, ponto e hifen.");
        }

        return pagina("Comando corrigido", """
                <h1>Resultado do comando</h1>
                <p>Comando validado: %s</p>
                <pre>Execucao real bloqueada por seguranca.</pre>
                """.formatted(escaparHtml(prefixoComando + host)));
    }

    private String htmlErro(String titulo, String detalhe, String mensagem) {
        return pagina(titulo, """
                <h1>%s</h1>
                <p>%s</p>
                <pre>%s</pre>
                """.formatted(escaparHtml(titulo), escaparHtml(detalhe), escaparHtml(mensagem)));
    }

    private String pagina(String titulo, String conteudo) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <title>%s</title>
                </head>
                <body>
                    %s
                    <a href="/zap-lab">Voltar</a>
                </body>
                </html>
                """.formatted(escaparHtml(titulo), conteudo);
    }

    private String formulario(String titulo, String action, String nomeCampo, String valorCampo) {
        return """
                <h2>%s</h2>
                <form action="%s" method="get">
                    <input name="%s" value="%s">
                    <button type="submit">Testar</button>
                </form>
                """.formatted(
                escaparHtml(titulo),
                escaparHtml(action),
                escaparHtml(nomeCampo),
                escaparHtml(valorCampo)
        );
    }

    private void aplicarCabecalhosDeSeguranca(HttpServletResponse response) {
        // Correcao: a politica limita scripts, formularios e conteudos externos no navegador.
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data:; " +
                        "connect-src 'self'; " +
                        "font-src 'self'; " +
                        "object-src 'none'; " +
                        "base-uri 'self'; " +
                        "form-action 'self'; " +
                        "frame-ancestors 'none'");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "no-referrer");
    }

    private int converterId(String id) {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException exception) {
            // Correcao: valores invalidos nao entram na consulta.
            return -1;
        }
    }

    private String escaparHtml(String valor) {
        if (valor == null) {
            return "";
        }

        return valor
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
