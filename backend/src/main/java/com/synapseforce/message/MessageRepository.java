package com.synapseforce.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // All messages in a conversation between two users, ordered by time
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :u1 AND m.receiver.id = :u2) OR (m.sender.id = :u2 AND m.receiver.id = :u1) ORDER BY m.sentAt ASC")
    List<Message> findConversation(Long u1, Long u2);

    // All messages involving a user (either sent or received)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.sentAt DESC")
    List<Message> findAllInvolving(Long userId);

    long countBySenderIdAndReceiverIdAndReadFalse(Long senderId, Long receiverId);
}
