package com.github.leloxo.socialmediaclone.service;

import com.github.leloxo.socialmediaclone.exception.ResourceNotFoundException;
import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.model.UserFollow;
import com.github.leloxo.socialmediaclone.repository.UserFollowRepository;
import com.github.leloxo.socialmediaclone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserFollowService {
    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;

    public UserFollowService(UserRepository userRepository, UserFollowRepository userFollowRepository) {
        this.userRepository = userRepository;
        this.userFollowRepository = userFollowRepository;
    }

    @Transactional
    public void followUser(Long followerId, Long followingId) throws ResourceNotFoundException {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }

        if (userFollowRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower user not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        UserFollow userFollow = new UserFollow();
        userFollow.setFollower(follower);
        userFollow.setFollowing(following);
        userFollowRepository.save(userFollow);
    }

    @Transactional
    public void unfollowUser(Long followerId, Long followingId) throws ResourceNotFoundException {
        if (!userRepository.existsById(followerId)) {
            throw new ResourceNotFoundException("Follower user not found");
        }
        if (!userRepository.existsById(followingId)) {
            throw new ResourceNotFoundException("Target user not found");
        }

        userFollowRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) throws ResourceNotFoundException {
        if (!userRepository.existsById(followerId)) {
            throw new ResourceNotFoundException("Follower user not found");
        }
        if (!userRepository.existsById(followingId)) {
            throw new ResourceNotFoundException("Target user not found");
        }

        return userFollowRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Transactional(readOnly = true)
    public List<User> getFollowers(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userFollowRepository.findFollowersByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public List<Long> getFollowerIds(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userFollowRepository.findFollowerIdsByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public List<User> getFollowing(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userFollowRepository.findFollowingByFollowerId(userId);
    }

    @Transactional(readOnly = true)
    public List<Long> getFollowingIds(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        List<Long> followingIds = userFollowRepository.findFollowingIdsByFollowerId(userId);
        followingIds.add(userId); // Include the current user's posts
        return followingIds;
    }

    @Transactional(readOnly = true)
    public long getFollowersCount(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userFollowRepository.countByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) throws ResourceNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userFollowRepository.countByFollowerId(userId);
    }
}
