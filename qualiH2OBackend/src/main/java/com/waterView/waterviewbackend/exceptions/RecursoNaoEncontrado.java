package com.waterView.waterviewbackend.exceptions;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class RecursoNaoEncontrado extends RuntimeException{
    private static final long serialVersionUID = 1L;

    public RecursoNaoEncontrado(String ex) {
        super(ex);
    }
}
