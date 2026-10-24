package com.movieticket.review.service;

import com.movieticket.review.entity.Review;
import com.movieticket.review.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public Review createReview(Review review) {

        if (reviewRepository.existsByUserIdAndMovieId(
                review.getUserId(), review.getMovieId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User has already reviewed this movie"
            );
        }

        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5"
            );
        }

        review.setStatus("APPROVED");
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByMovie(Long movieId) {
        return reviewRepository.findByMovieIdAndStatus(movieId, "APPROVED");
    }

    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Double getAverageRating(Long movieId) {
        Double avg = reviewRepository.findAverageRatingByMovieId(movieId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public Review updateReview(Long id, Review updatedReview) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Review not found"
                ));

        review.setRating(updatedReview.getRating());
        review.setReviewText(updatedReview.getReviewText());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Review not found"
                ));
        reviewRepository.delete(review);
    }
}
