package com.example.academic_support_portal.resource.repository;

import com.example.academic_support_portal.resource.model.AcademicResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AcademicResourceRepository extends MongoRepository<AcademicResource, String> {
  List<AcademicResource> findBySubject(String subject);
}
