package com.github.leloxo.socialmediaclone.repository;

import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.model.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    @Query("SELECT uf.follower FROM UserFollow uf WHERE uf.following.id = :followingId")
    List<User> findFollowersByFollowingId(@Param("followingId") Long followingId);

    @Query("SELECT uf.follower.id FROM UserFollow uf WHERE uf.following.id = :followingId")
    List<Long> findFollowerIdsByFollowingId(@Param("followingId") Long followingId);

    @Query("SELECT uf.following FROM UserFollow uf WHERE uf.follower.id = :followerId")
    List<User> findFollowingByFollowerId(@Param("followerId") Long followerId);

    @Query("SELECT uf.following.id FROM UserFollow uf WHERE uf.follower.id = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);

    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);
}
