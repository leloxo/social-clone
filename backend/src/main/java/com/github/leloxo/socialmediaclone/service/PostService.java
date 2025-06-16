package com.github.leloxo.socialmediaclone.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.github.leloxo.socialmediaclone.exception.*;
import com.github.leloxo.socialmediaclone.model.Comment;
import com.github.leloxo.socialmediaclone.model.Post;
import com.github.leloxo.socialmediaclone.model.PostLike;
import com.github.leloxo.socialmediaclone.model.User;
import com.github.leloxo.socialmediaclone.repository.CommentRepository;
import com.github.leloxo.socialmediaclone.repository.PostLikeRepository;
import com.github.leloxo.socialmediaclone.repository.PostRepository;
import com.github.leloxo.socialmediaclone.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class PostService {
    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    private final Cloudinary cloudinary;
    private final PostRepository postRepository;
    private final UserFollowService userFollowService;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    public PostService(Cloudinary cloudinary, PostRepository postRepository, UserFollowService userFollowService, UserRepository userRepository, PostLikeRepository postLikeRepository, CommentRepository commentRepository) {
        this.cloudinary = cloudinary;
        this.postRepository = postRepository;
        this.userFollowService = userFollowService;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
    }

    // Cloudinary Docs:
    // https://cloudinary.com/documentation/image_upload_api_reference#upload
    // https://cloudinary.com/documentation/java_quickstart

    public String uploadImage(MultipartFile image) throws IOException {
        validateImage(image);

        try {
            byte[] fileBytes = image.getBytes();
            Map uploadResult = cloudinary.uploader().upload(fileBytes,
                    ObjectUtils.asMap("resource_type", "auto"));

            logger.debug("Cloudinary upload successful. Public ID: {}", uploadResult.get("public_id"));
            return (String) uploadResult.get("url");
        } catch (IOException e) {
            logger.error("Failed to upload image to Cloudinary", e);
            if (e instanceof InvalidFileException) {
                throw new InvalidFileException("Invalid or corrupted file: " + e.getMessage());
            } else {
                throw new CloudinaryUploadException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        }
    }

    private void validateImage(MultipartFile image) throws InvalidFileException {
        if (image == null || image.isEmpty()) {
            logger.warn("Empty image file received");
            throw new InvalidFileException("Image file is required");
        }

        // 10MB limit
        if (image.getSize() > 10 * 1024 * 1024) {
            throw new InvalidFileException("Image file is too large. Maximum size is 10MB.");
        }

        String contentType = image.getContentType();
        if (contentType == null
                || !(contentType.equals("image/jpeg")
                || contentType.equals("image/png")
//                || contentType.equals("image/gif")
                || contentType.equals("image/webp"))) {
            throw new InvalidFileException("Unsupported file type. Please upload JPEG, GIF or WebP images.");
        }
    }

    @Transactional
    @CacheEvict(value = {"userPosts", "userFeed"}, key = "#authorId")
    public Post createPost(String caption, String imageUrl, Long authorId) throws ResourceNotFoundException {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + authorId + " not found"));

        Post post = new Post();
        post.setCaption(caption);
        post.setImageUrl(imageUrl);
        post.setAuthor(author);

        return postRepository.save(post);
    }

    @Transactional
    @CacheEvict(value = {"userPosts", "userFeed"}, key = "#authorId")
    public void deletePost(Long authorId, Long postId) throws ResourceNotFoundException, CloudinaryDeleteException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new UnauthorizedException("You are not allowed to delete this post");
        }

        if (post.getImageUrl() != null) {
            try {
                String publicId = extractPublicId(post.getImageUrl());
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (IOException e) {
                logger.warn("Failed to delete image from Cloudinary: {}", e.getMessage());
                throw new CloudinaryDeleteException("Failed to delete image from Cloudinary");
            }
        }

        postRepository.delete(post);
    }

    private String extractPublicId(String imageUrl) {
        return imageUrl.substring(imageUrl.lastIndexOf("/") + 1, imageUrl.lastIndexOf("."));
    }

    @Transactional
    @CacheEvict(value = "postLikes", key = "#postId")
    public Post likePost(Long postId, Long userId) throws ResourceNotFoundException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        if (!postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);

            try {
                postLikeRepository.save(like);
                post.incrementLikeCount();
                postRepository.save(post);
            } catch (DataIntegrityViolationException e) {
                throw new DuplicateLikeException("User has already liked this post");
            }
        }

        return post;
    }

    @Transactional
    @CacheEvict(value = "postLikes", key = "#postId")
    public Post unlikePost(Long postId, Long userId) throws ResourceNotFoundException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));
        PostLike like = postLikeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Like not found for post ID " + postId + " and user ID " + userId));

        postLikeRepository.delete(like);
        post.decrementLikeCount();

        postRepository.save(post);

        return post;
    }

    // TODO: only select necessary user information from post comments (getReferenceById(postId))
    // TODO: returns updated post with new comment?
    @Transactional
    @CacheEvict(value = "postComments", key = "#postId")
    public Post addComment(Long userId, Long postId, String content) throws ResourceNotFoundException {
        Post post = postRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

        Comment comment = new Comment();
        comment.setAuthor(user);
        comment.setPost(post);
        comment.setContent(content);

        commentRepository.save(comment);

        post.incrementCommentCount();
        post.getComments().add(comment);

        return postRepository.save(post);
    }

    @Transactional
    @CacheEvict(value = "postComments", key = "#postId")
    public Post removeComment(Long userId, Long postId, Long commentId) throws ResourceNotFoundException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment with ID " + commentId + " not found"));

        if (!comment.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Comment with ID " + commentId + " is not in the post");
        }
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ResourceNotFoundException("Comment with ID " + commentId + " is not in the author");
        }

        commentRepository.delete(comment);
        post.decrementCommentCount();
        postRepository.save(post);

        return post;
    }

    @Cacheable(value = "postDetails", key = "#postId")
    public Post getPostById(Long postId) throws ResourceNotFoundException {
        return postRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post with ID " + postId + " not found"));
    }

    @Cacheable(value = "userPostsByName", key = "#username")
    public Page<Post> getPostsByUserName(String username, Pageable pageable) {
        return postRepository.findByAuthorUserNameWithDetails(username, pageable);
    }

    @Cacheable(value = "userFeed", key = "#userId")
    public Page<Post> getFeedForUser(Long userId, Pageable pageable) throws ResourceNotFoundException {
        List<Long> followingIds = userFollowService.getFollowingIds(userId);
        if (followingIds.isEmpty()) {
            return Page.empty(pageable);
        }

        return postRepository.findByAuthorIdsIn(followingIds, pageable);
    }

    @Cacheable(value = "postComments", key = "#postId")
    public int getLikeCount(Long postId) throws ResourceNotFoundException {
        return postRepository.findLikeCountById(postId);
    }

    @Cacheable(value = "postLikes", key = "#postId")
    public int getCommentCount(Long postId) throws ResourceNotFoundException {
        return postRepository.findCommentCountById(postId);
    }

    @Transactional(readOnly = true)
    public boolean hasUserLikedPost(Long userId, Long postId) {
        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }
}
