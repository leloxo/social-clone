package com.github.leloxo.socialmediaclone.repository;

import com.github.leloxo.socialmediaclone.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query(value = """
        SELECT p FROM Post p
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.comments c
        LEFT JOIN FETCH c.author
        WHERE p.author.userName = :username
        """, countQuery = """
        SELECT COUNT(DISTINCT p) FROM Post p
        WHERE p.author.userName = :username
        """)
    Page<Post> findByAuthorUserNameWithDetails(String username, Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.comments c
        LEFT JOIN FETCH c.author
        WHERE p.id = :postId
        """)
    Optional<Post> findByIdWithDetails(Long postId);

    @Query(" SELECT p.likeCount FROM Post p WHERE p.id = :postId")
    int findLikeCountById(@Param("postId") Long postId);

    @Query("SELECT p.commentCount FROM Post p WHERE p.id = :postId")
    int findCommentCountById(@Param("postId") Long postId);

    // TODO: are joins necessary?
    @Query(value = """
        SELECT DISTINCT p
        FROM Post p
        LEFT JOIN FETCH p.author
        LEFT JOIN FETCH p.comments c
        LEFT JOIN FETCH c.author
        WHERE p.author.id IN :authorIds
        ORDER BY p.createdAt DESC
        """, countQuery = """
        SELECT COUNT(DISTINCT p) FROM Post p
        WHERE p.author.id IN :authorIds
        """)
    Page<Post> findByAuthorIdsIn(@Param("authorIds") List<Long> authorIds, Pageable pageable);
}
