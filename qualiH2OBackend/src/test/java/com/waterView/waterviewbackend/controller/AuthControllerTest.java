package com.waterView.waterviewbackend.controller;

import com.waterView.waterviewbackend.dto.AuthTestDTO;
import com.waterView.waterviewbackend.external.request.AuthRequestDTO;
import com.waterView.waterviewbackend.external.response.TokenResponseDTO;
import com.waterView.waterviewbackend.testcontainers.AbstractIntegrationTest;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.testcontainers.shaded.com.fasterxml.jackson.core.JsonProcessingException;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.JsonMappingException;

import static com.waterView.waterviewbackend.configs.TestConfigs.*;
import static io.restassured.RestAssured.given;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthControllerTest extends AbstractIntegrationTest {

    private static final String ENDPOINT_AUTH = "/signin";

    @LocalServerPort
    int port;

    private static TokenResponseDTO token;
    private static AuthRequestDTO validUser;
    private static AuthRequestDTO invalidUser;

    @BeforeAll
    public static void setupTest() {
        validUser = new AuthRequestDTO("01234567", "Senha1234");
        invalidUser = new AuthRequestDTO("Invalid", "Invalid");
        token = new TokenResponseDTO();
    }

    @BeforeEach
    public void setupRestAssuredPort() {
        io.restassured.RestAssured.port = port;
    }

    @Test
    @Order(1)
    public void givenValidUserCredentials_whenSignIn_thenReturnToken() throws JsonMappingException, JsonProcessingException {
        token = given()
                    .basePath(BASE_AUTH_URL + ENDPOINT_AUTH)
//                    .port(SERVER_PORT)
                    .contentType(CONTENT_TYPE_JSON)
                .body(validUser)
                    .when()
                .post()
                    .then()
                    .statusCode(HttpStatus.OK.value())
                        .extract()
                        .body()
                            .as(TokenResponseDTO.class);

        Assertions.assertNotNull(token.getAccessToken());
    }

    @Test
    @Order(2)
    public void givenInvalidUserCredencials_whenSingIn_thenReturnError403() {
        given()
            .basePath(BASE_AUTH_URL + ENDPOINT_AUTH)
//                .port(SERVER_PORT)
                .contentType(CONTENT_TYPE_JSON)
            .body(invalidUser)
                .when()
            .post()
                .then()
                .statusCode(HttpStatus.FORBIDDEN.value());
    }

    @Test
    @Order(3)
    public void givenNullCredencials_whenSingIn_thenReturnError403() {

        AuthTestDTO nullUser = new AuthTestDTO();

        given()
                .basePath(BASE_AUTH_URL + ENDPOINT_AUTH)
//                .port(SERVER_PORT)
                    .contentType(CONTENT_TYPE_JSON)
                .body(nullUser)
                    .when()
                .post()
                    .then()
                    .statusCode(HttpStatus.FORBIDDEN.value());
    }

    @Test
    @Order(4)
    public void givenWrongCredencials_whenSingIn_thenReturnError403_AndAfterWithCorrectCredencial_thenReturn200() {
        validUser.setUsername("1234567");

        given()
                .basePath(BASE_AUTH_URL + ENDPOINT_AUTH)
//                .port(SERVER_PORT)
                    .contentType(CONTENT_TYPE_JSON)
                .body(invalidUser)
                    .when()
                .post()
                    .then()
                    .statusCode(HttpStatus.FORBIDDEN.value());

        validUser.setUsername("01234567");

        given()
                .basePath(BASE_AUTH_URL + ENDPOINT_AUTH)
//                    .port(SERVER_PORT)
                    .contentType(CONTENT_TYPE_JSON)
                .body(validUser)
                    .when()
                .post()
                    .then()
                        .statusCode(HttpStatus.OK.value());
    }
}
