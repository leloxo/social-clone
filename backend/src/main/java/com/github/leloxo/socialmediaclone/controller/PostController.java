package com.github.leloxo.socialmediaclone.controller;

import com.github.leloxo.socialmediaclone.dto.DataConvertor;
import com.github.leloxo.socialmediaclone.dto.request.CommentRequest;
import com.github.leloxo.socialmediaclone.dto.request.UploadPostRequest;
import com.github.leloxo.socialmediaclone.dto.response.ApiResponse;
import com.github.leloxo.socialmediaclone.dto.response.CommentResponse;
import com.github.leloxo.socialmediaclone.dto.response.LikeResponse;
import com.github.leloxo.socialmediaclone.dto.response.PostDetailsResponse;
import com.github.leloxo.socialmediaclone.exception.CloudinaryDeleteException;
import com.github.leloxo.socialmediaclone.exception.ResourceNotFoundException;
import com.github.leloxo.socialmediaclone.model.Post;
import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/posts")
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    private final PostService postService;
    private final DataConvertor dataConvertor;

    public PostController(PostService postService, DataConvertor dataConvertor) {
        this.postService = postService;
        this.dataConvertor = dataConvertor;
    }

    @PostMapping
    public ResponseEntity<PostDetailsResponse> uploadPost(
            @Valid @ModelAttribute UploadPostRequest uploadPostRequest,
            @AuthenticationPrincipal User currentUser
    ) throws IOException, ResourceNotFoundException {
        logger.info("Received request to create post from user: {}", currentUser.getUsername());

        String imageUrl = postService.uploadImage(uploadPostRequest.getImage());
        Post newPost = postService.createPost(uploadPostRequest.getCaption(), imageUrl, currentUser.getId());

        logger.info("Successfully created post with ID: {}", newPost.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(dataConvertor.toPostDto(newPost));
    }

    @PostMapping("/images")
    public ResponseEntity<String> uploadImage(
            @RequestPart("image") MultipartFile image
    ) throws IOException {
        logger.info("Received request to upload image, file size: {}", image.getSize());

        String imageUrl = postService.uploadImage(image);

        logger.info("Successfully uploaded image, URL: {}", imageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(imageUrl);
    }

    // TODO: add HATEOAS?
    @GetMapping("/{postId}")
    public ResponseEntity<PostDetailsResponse> getPostById(
            @PathVariable Long postId
    ) throws ResourceNotFoundException {
        logger.info("Retrieving post with ID: {}", postId);

        Post post = postService.getPostById(postId);
        return ResponseEntity.ok(dataConvertor.toPostDto(post));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PostDetailsResponse>> getPostsByUser(
            @PathVariable String username,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        logger.info("Retrieving posts for user: {}, page: {}, size: {}", username, pageable.getPageNumber(), pageable.getPageSize());

        Page<Post> posts = postService.getPostsByUserName(username, pageable);
        Page<PostDetailsResponse> postDtos = posts.map(dataConvertor::toPostDto);

        logger.info("Retrieved {} posts for user: {}", posts.getTotalElements(), username);
        return ResponseEntity.ok(postDtos);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse> removePost(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId
    ) throws ResourceNotFoundException, CloudinaryDeleteException {
        logger.info("User {} is removing post {}", currentUser.getUsername(), postId);

        try {
            postService.deletePost(currentUser.getId(), postId);
            return ResponseEntity.ok(new ApiResponse(true, "Successfully removed post with ID: " + postId));
        } catch (ResourceNotFoundException | CloudinaryDeleteException e) {
            logger.warn("Failed to remove post: {}", e.getMessage());
            throw e;
        }
    }

    // TODO: response message
    @GetMapping("/feed")
    public ResponseEntity<Page<PostDetailsResponse>> getFeed(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) throws ResourceNotFoundException {
        logger.info("Retrieving feed for user: {}, page: {}, size: {}", currentUser.getUsername(), pageable.getPageNumber(), pageable.getPageSize());

        Page<Post> feed = postService.getFeedForUser(currentUser.getId(), pageable);
//        Page<PostFeedResponse> feedDtos = feed.map(dataConvertor::toFeedDto);
        Page<PostDetailsResponse> postDtos = feed.map(dataConvertor::toPostDto);

        logger.info("Retrieved {} feed posts for user: {}", feed.getTotalElements(), currentUser.getUsername());
        return ResponseEntity.ok(postDtos);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> likePost(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId
    ) throws ResourceNotFoundException {
        try {
            Post post = postService.likePost(postId, currentUser.getId());
            int newLikeCount = postService.getLikeCount(postId);

            logger.info("User {} is liking post {}", currentUser.getUsername(), postId);

            return ResponseEntity.ok(new LikeResponse(post.getId(), newLikeCount, "Post liked successfully"));
        } catch (ResourceNotFoundException e) {
            logger.warn("Failed to like post: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> unlikePost(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId
    ) throws ResourceNotFoundException {
        try {
            Post post = postService.unlikePost(postId, currentUser.getId());
            int newLikeCount = postService.getLikeCount(postId);

            logger.info("User {} is unliking post {}", currentUser.getUsername(), postId);

            return ResponseEntity.ok(new LikeResponse(post.getId(), newLikeCount, "Post unliked successfully"));
        } catch (ResourceNotFoundException e) {
            logger.warn("Failed to unlike post: {}", e.getMessage());
            throw e;
        }
    }

    @GetMapping("/{postId}/status")
    public ResponseEntity<ApiResponse> isLikedByUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId
    ) {
        boolean isLiked = postService.hasUserLikedPost(currentUser.getId(), postId);
        return ResponseEntity.ok(new ApiResponse(isLiked, "Liked status"));
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest
    ) throws ResourceNotFoundException {
        logger.info("User {} is adding comment to post {}", currentUser.getUsername(), postId);

        try {
            Post post = postService.addComment(currentUser.getId(), postId, commentRequest.getContent());
            int newCommentCount = postService.getCommentCount(postId);

            return ResponseEntity.ok(new CommentResponse(post.getId(), newCommentCount, dataConvertor.toPostDto(post)));
        } catch (ResourceNotFoundException e) {
            logger.warn("Failed to add comment: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<CommentResponse> removeComment(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) throws ResourceNotFoundException {
        logger.info("User {} is removing comment to post {}", currentUser.getUsername(), postId);

        try {
            Post post = postService.removeComment(currentUser.getId(), postId, commentId);
            int newCommentCount = postService.getCommentCount(postId);

            return ResponseEntity.ok(new CommentResponse(post.getId(), newCommentCount, dataConvertor.toPostDto(post)));
        } catch (ResourceNotFoundException e) {
            logger.warn("Failed to remove comment: {}", e.getMessage());
            throw e;
        }
    }
}
