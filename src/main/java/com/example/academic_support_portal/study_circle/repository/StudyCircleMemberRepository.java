package com.example.academic_support_portal.study_circle.repository;

import com.example.academic_support_portal.study_circle.model.StudyCircleMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudyCircleMemberRepository extends MongoRepository<StudyCircleMember, String> {
  List<StudyCircleMember> findByCircleIdOrderByJoinedAtAsc(String circleId);

  Optional<StudyCircleMember> findByCircleIdAndUserId(String circleId, String userId);

  boolean existsByCircleIdAndUserId(String circleId, String userId);

  long countByCircleId(String circleId);

  List<StudyCircleMember> findByUserIdOrderByJoinedAtDesc(String userId);
}
