package com.example.academic_support_portal.study_circle.repository;

import com.example.academic_support_portal.study_circle.model.StudyCircle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudyCircleRepository extends MongoRepository<StudyCircle, String> {
  List<StudyCircle> findByIsActiveTrueOrderByCreatedAtDesc();

  List<StudyCircle> findByIdInAndIsActiveTrueOrderByCreatedAtDesc(List<String> ids);
}
