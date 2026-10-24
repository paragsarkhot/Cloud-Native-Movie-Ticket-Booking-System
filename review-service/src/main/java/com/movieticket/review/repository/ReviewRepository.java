package com.movieticket.review.repository;

import com.movieticket.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMovieIdAndStatus(Long movieId, String status);

    List<Review> findByUserId(Long userId);

    List<Review> findByStatus(String status);

    boolean existsByUserIdAndMovieId(Long userId, Long movieId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.movieId = :movieId AND r.status = 'APPROVED'")
    Double findAverageRatingByMovieId(Long movieId);
}
