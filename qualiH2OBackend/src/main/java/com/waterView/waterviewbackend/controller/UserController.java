package com.waterView.waterviewbackend.controller;

import com.waterView.waterviewbackend.external.request.UserUpdateRequestDTO;
import com.waterView.waterviewbackend.external.response.UserResponseDTO;
import com.waterView.waterviewbackend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User endpoints")
@RestController
@RequestMapping("api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Edita dados do usuário",
        responses = {
                @ApiResponse(description = "Updated", responseCode = "200",
                        content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
                ),
                @ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
                @ApiResponse(description = "Not Found", responseCode = "404", content = @Content)
        }
    )
    @PutMapping(value = "/{username}",
            consumes = { MediaType.APPLICATION_JSON_VALUE },
            produces = { MediaType.APPLICATION_JSON_VALUE })
    public UserResponseDTO update(
            @PathVariable String username,
            @RequestBody UserUpdateRequestDTO data) {
        return userService.editaUsuario(username, data);
    }
}
