package com.example.academic_support_portal.tutor_request.controller;

import com.example.academic_support_portal.tutor_request.dto.TutorRequestActionResponse;
import com.example.academic_support_portal.tutor_request.dto.TutorRequestStatusUpdateRequest;
import com.example.academic_support_portal.tutor_request.model.TutorRequest;
import com.example.academic_support_portal.tutor_request.service.TutorRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutor-requests")
@RequiredArgsConstructor
public class TutorRequestController {
  private final TutorRequestService service;

  @GetMapping
  public List<TutorRequest> getAll(
      @RequestParam(required = false) String studentId,
      @RequestParam(required = false) String tutorEmail) {
    if (studentId != null && !studentId.isEmpty()) {
      return service.getByStudentId(studentId);
    }
    if (tutorEmail != null && !tutorEmail.isEmpty()) {
      return service.getByTutorEmail(tutorEmail);
    }
    return service.getAll();
  }

  @PostMapping
  public TutorRequestActionResponse create(@Valid @RequestBody TutorRequest request) {
    return service.create(request);
  }

  @GetMapping("/tutor")
  @PreAuthorize("hasRole('TUTOR')")
  public List<TutorRequest> getTutorRequests(
      @RequestParam(required = false) String email,
      @RequestParam(required = false) String status) {
    return service.getForCurrentTutor(email, status);
  }

  @PatchMapping("/{id}/status")
  public TutorRequestActionResponse updateStatus(
      @PathVariable String id,
      @RequestParam String status,
      @RequestBody(required = false) TutorRequestStatusUpdateRequest payload) {
    return service.updateStatus(id, status, payload);
  }

  @PatchMapping("/{id}/accept")
  @PreAuthorize("hasRole('TUTOR')")
  public TutorRequestActionResponse acceptRequest(
      @PathVariable String id,
      @RequestBody TutorRequestStatusUpdateRequest payload) {
    return service.acceptRequest(id, payload);
  }

  @PatchMapping("/{id}/reject")
  @PreAuthorize("hasRole('TUTOR')")
  public TutorRequestActionResponse rejectRequest(@PathVariable String id) {
    return service.rejectRequest(id);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable String id) {
    service.delete(id);
  }
}
