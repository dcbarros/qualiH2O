package com.waterView.waterviewbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "users")
public class User implements UserDetails {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username; //matrícula
    private String email;
    private String senha;
    private String nome;
    private Boolean estaAtivo;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_permission", joinColumns = {@JoinColumn (name = "user_id")},
            inverseJoinColumns = {@JoinColumn (name = "permission_id")}
    )
    private List<Permissoes> permissao;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissao;
    }

    public List<String> getRoles() {
        List<String> roles = new ArrayList<>();
        for (Permissoes permission : permissao) {
            roles.add(permission.getDescription());
        }
        return roles;
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isEnabled() {
        return estaAtivo;
    }

}
