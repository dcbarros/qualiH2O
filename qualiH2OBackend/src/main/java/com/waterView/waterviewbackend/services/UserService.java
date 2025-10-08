package com.waterView.waterviewbackend.services;

import com.waterView.waterviewbackend.exceptions.RecursoNaoEncontrado;
import com.waterView.waterviewbackend.exceptions.RequisicaoMalFormada;
import com.waterView.waterviewbackend.external.request.UserUpdateRequestDTO;
import com.waterView.waterviewbackend.external.response.UserResponseDTO;
import com.waterView.waterviewbackend.mapper.DozerMapper;
import com.waterView.waterviewbackend.repository.UserRepository;

import java.util.logging.Logger;

import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.waterView.waterviewbackend.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService{

    private Logger logger = Logger.getLogger(UserService.class.getName());

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Buscando um usuário com a matrícula: " + username + "!");
        var user = repository.findByUsername(username);
        if (user != null) {
            return user;
        } else {
            throw new UsernameNotFoundException("Mátricula " + username + " não encontrada!");
        }
    }

    @Transactional
    public UserResponseDTO editaUsuario(String username, UserUpdateRequestDTO request) {
        if(request == null) throw new RequisicaoMalFormada("Dados da requisição não encontrados");

        User user = repository.findByUsername(username);

        if(user == null) throw new RecursoNaoEncontrado("Usuário não encontrado");

        if(request.getEmail() != null && !request.getEmail().isBlank()){

            if(repository.existsByEmailIgnoreCaseAndIdNot(request.getEmail(), user.getId())) {
                throw new RequisicaoMalFormada("Email já existe no registro");
            }
            user.setEmail(request.getEmail());
        }

        if(request.getSenhaNova() != null && !request.getSenhaNova().isBlank()) {

            if (request.getSenhaAntiga() == null || request.getSenhaAntiga().isBlank()) {
                throw new RequisicaoMalFormada("Senha antiga é obrigatória para alterar a senha");
            }

            var confere = passwordEncoder.matches(request.getSenhaAntiga(), user.getSenha());
            if (!confere) throw new RequisicaoMalFormada("Senha antiga inválida");

            if (passwordEncoder.matches(request.getSenhaNova(), user.getSenha())) {
                throw new RequisicaoMalFormada("A nova senha não pode ser igual à senha atual");
            }

            user.setSenha(passwordEncoder.encode(request.getSenhaNova()));
        }

        return DozerMapper.parseObject(repository.save(user), UserResponseDTO.class);
    }
}
