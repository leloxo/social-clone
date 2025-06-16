package com.github.leloxo.socialmediaclone.repository;

import com.github.leloxo.socialmediaclone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserName(String username);
    List<User> findByUserNameContainingIgnoreCase(String userName);
}
