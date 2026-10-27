package com.movieticket.review;

import com.movieticket.review.entity.Review;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ReviewServiceApplicationTests {

    @Test
    void testReviewEntityCreation() {
        Review review = new Review();
        review.setUserId(1L);
        review.setMovieId(10L);
        review.setRating(5);
        review.setReviewText("Incredible movie experience!");
        review.setStatus("APPROVED");

        assertEquals(1L, review.getUserId());
        assertEquals(10L, review.getMovieId());
        assertEquals(5, review.getRating());
        assertEquals("Incredible movie experience!", review.getReviewText());
        assertEquals("APPROVED", review.getStatus());
    }
}
