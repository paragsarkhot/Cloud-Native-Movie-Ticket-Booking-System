package com.movieticket.notification;

import com.movieticket.notification.entity.Notification;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NotificationServiceApplicationTests {

    @Test
    void testNotificationEntityCreation() {
        Notification notif = new Notification();
        notif.setUserId(1L);
        notif.setType("BOOKING_CONFIRMATION");
        notif.setMessage("Your ticket is confirmed!");
        notif.setChannel("EMAIL");
        notif.setStatus("SENT");

        assertEquals(1L, notif.getUserId());
        assertEquals("BOOKING_CONFIRMATION", notif.getType());
        assertEquals("Your ticket is confirmed!", notif.getMessage());
        assertEquals("EMAIL", notif.getChannel());
        assertEquals("SENT", notif.getStatus());
    }
}
