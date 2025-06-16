package com.github.leloxo.socialmediaclone.repository;

import com.github.leloxo.socialmediaclone.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
