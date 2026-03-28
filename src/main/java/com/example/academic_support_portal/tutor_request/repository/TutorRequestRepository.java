package com.example.academic_support_portal.tutor_request.repository;

import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TutorRequestRepository extends MongoRepository<TutorRequest, String> {
  List<TutorRequest> findByStudentId(String studentId);
  List<TutorRequest> findByTutorEmailIgnoreCase(String tutorEmail);
  List<TutorRequest> findByTutorEmailIgnoreCaseOrderByCreatedAtDesc(String tutorEmail);
  List<TutorRequest> findByTutorEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String tutorEmail, String status);
  List<TutorRequest> findByTutorIdOrderByCreatedAtDesc(String tutorId);
  List<TutorRequest> findByTutorIdAndStatusOrderByCreatedAtDesc(String tutorId, String status);
  List<TutorRequest> findByTutorNameIgnoreCaseOrderByCreatedAtDesc(String tutorName);
  List<TutorRequest> findByTutorNameIgnoreCaseAndStatusOrderByCreatedAtDesc(String tutorName, String status);
  List<TutorRequest> findByStatusOrderByCreatedAtDesc(String status);
}
