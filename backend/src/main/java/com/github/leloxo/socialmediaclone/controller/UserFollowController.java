package com.github.leloxo.socialmediaclone.controller;

import com.github.leloxo.socialmediaclone.dto.DataConvertor;
import com.github.leloxo.socialmediaclone.dto.response.*;
import com.github.leloxo.socialmediaclone.exception.ResourceNotFoundException;
import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.service.UserFollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/follows")
public class UserFollowController {
    // TODO: Add pagination to get follower/following

    private final UserFollowService userFollowService;
    private final DataConvertor dataConvertor;

    public UserFollowController(UserFollowService userFollowService, DataConvertor dataConvertor) {
        this.userFollowService = userFollowService;
        this.dataConvertor = dataConvertor;
    }

    @PostMapping("/{targetUserId}")
    public ResponseEntity<ApiResponse> followUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId
    ) throws ResourceNotFoundException {
        userFollowService.followUser(currentUser.getId(), targetUserId);
        return ResponseEntity.ok(new ApiResponse(true, "Successfully followed user"));
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<ApiResponse> unfollowUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId
    ) throws ResourceNotFoundException {
        userFollowService.unfollowUser(currentUser.getId(), targetUserId);
        return ResponseEntity.ok(new ApiResponse(true, "Successfully unfollowed user"));
    }

    @GetMapping("/followers")
    public ResponseEntity<FollowersResponse> getFollowers(
            @AuthenticationPrincipal User currentUser
    ) throws ResourceNotFoundException {
        List<User> followers = userFollowService.getFollowers(currentUser.getId());
        List<UserSummaryResponse> followerDtos = dataConvertor.toUserSummaryDtoList(followers);

        return ResponseEntity.ok(new FollowersResponse(followerDtos, followerDtos.size()));
    }

    @GetMapping("/following")
    public ResponseEntity<FollowingResponse> getFollowing(
            @AuthenticationPrincipal User currentUser
    ) throws ResourceNotFoundException {
        List<User> following = userFollowService.getFollowing(currentUser.getId());
        List<UserSummaryResponse> followingDtos = dataConvertor.toUserSummaryDtoList(following);

        return ResponseEntity.ok(new FollowingResponse(followingDtos, followingDtos.size()));
    }

    @GetMapping("/user/{userId}/following")
    public ResponseEntity<UserFollowingResponse> getUserFollowing(
            @PathVariable Long userId
    ) throws ResourceNotFoundException {
        List<User> following = userFollowService.getFollowing(userId);
        List<UserSummaryResponse> followingDtos = dataConvertor.toUserSummaryDtoList(following);

        return ResponseEntity.ok(new UserFollowingResponse(userId, followingDtos, followingDtos.size()));
    }

    @GetMapping("/user/{userId}/followers")
    public ResponseEntity<UserFollowersResponse> getUserFollowers(
            @PathVariable Long userId
    ) throws ResourceNotFoundException {
        List<User> followers = userFollowService.getFollowers(userId);
        List<UserSummaryResponse> followerDtos = dataConvertor.toUserSummaryDtoList(followers);

        return ResponseEntity.ok(new UserFollowersResponse(userId, followerDtos, followerDtos.size()));
    }

    @GetMapping("/followers/count/{userId}")
    public ResponseEntity<FollowerCountResponse> getFollowersCount(
            @PathVariable Long userId
    ) throws ResourceNotFoundException {
        long count = userFollowService.getFollowersCount(userId);

        return ResponseEntity.ok(new FollowerCountResponse(userId, count));
    }

    @GetMapping("/following/count/{userId}")
    public ResponseEntity<FollowingCountResponse> getFollowingCount(
            @PathVariable Long userId
    ) throws ResourceNotFoundException {
        long count = userFollowService.getFollowingCount(userId);

        return ResponseEntity.ok(new FollowingCountResponse(userId, count));
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<FollowStatusResponse> getFollowStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId
    ) throws ResourceNotFoundException {
        boolean isFollowing = userFollowService.isFollowing(currentUser.getId(), targetUserId);

        return ResponseEntity.ok(new FollowStatusResponse(isFollowing, currentUser.getId(), targetUserId));
    }
}
