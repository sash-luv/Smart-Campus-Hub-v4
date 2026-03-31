import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  MapPin,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Shield,
  User as UserIcon,
  ArrowRight,
  BadgeCheck,
  Pencil,
  Trash2,
  Upload,
  FileText,
  Image
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { issueApi } from '../../api/issueApi';
import { useAuth } from '../../context/AuthContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CATEGORY_OPTIONS = [
  'FACILITIES',
  'IT_SERVICES',
  'SECURITY',
  'ACADEMIC',
  'OTHER'
];

const ACADEMIC_ISSUE_CATEGORIES = [
  'Lecturer / Teaching Issue',
  'Course Content Issue',
  'Assignment Issue',
  'Examination Issue',
  'Timetable Issue',
  'Group Project Issue',
  'Other'
];

const FACULTY_OPTIONS = ['Faculty of Computing', 'Faculty of Engineering', 'Humanities & Sciences', 'Faculty of Business'];

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const BUILDING_OPTIONS_ALL = [
  'Main Building',
  'New Building',
  'Main Auditorium',
  'Engineering Building',
  'Business Management Building',
  'Sports Areas',
  'Outdoor Locations',
  'Other'
];

const BUILDING_OPTIONS_IT = [
  'Main Building',
  'New Building',
  'Engineering Building',
  'Business Management Building',
  'Other'
];

const LOCATION_OPTIONS_BY_BUILDING = {
  'Main Building': {
    floors: ['Basement Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'],
    rooms: {
      'Basement Floor': [],
      'Floor 1': [],
      'Floor 2': ['Study Area', 'Equipment Room', 'Common area', 'Ladies Washroom', 'Mens Washroom'],
      'Floor 3': ['Study area', 'Common area', 'Hall A304', 'Ladies Washroom', 'Mens Washroom'],
      'Floor 4': ['Lab A410', 'Lab A412', 'Lab A405', 'Lab A411', 'Lab B401', 'Lab B402', 'Lab B403', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 5': ['Hall A503', 'Hall A505', 'Hall A506', 'Hall A507', 'Hall B501', 'Hall B502', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
    }
  },
  'New Building': {
    floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Floor 11', 'Floor 12', 'Floor 13', 'Floor 14'],
    rooms: {
      'Floor 1': [],
      'Floor 2': ['Library', 'New Canteen', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 3': ['Hall F301', 'Hall F302', 'Hall F303', 'Lab F304', 'Lab F305', 'Hall F307', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 4': ['Study Area', 'Hall F404', 'Hall F405', 'Hall F406', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 5': ['Hall F502', 'Hall F503', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 6': ['Hall G601', 'Hall G602', 'Hall G603', 'Hall G604', 'Hall G605', 'Hall G606', 'Hall F605', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 7': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 8': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 9': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 10': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 11': ['Hall G1101', 'Hall G1102', 'Lab G1103', 'Lab G1104', 'Lab G1105', 'Lab G1106', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 12': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 13': ['Lab G1301', 'Lab G1302', 'Lab G1303', 'Lab G1304', 'Lab G1305', 'Lab F1301', 'Lab F1302', 'Lab F1303', 'Lab F1304', 'Lab F1305', 'Lab F1306', 'Hall F1307', 'Hall F1308', 'Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 14': ['Hall G1401', 'Hall G1402', 'Hall F1401', 'Hall F1402', 'Ladies Washroom', 'Mens Washroom', 'Common area']
    }
  },
  'Engineering Building': {
    floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'],
    rooms: {
      'Floor 1': ['Lab 101', 'Lab 102', 'Lecture Hall 1', 'Office 101'],
      'Floor 2': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 3': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 4': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 5': ['Ladies Washroom', 'Mens Washroom', 'Common area'],
      'Floor 6': ['Ladies Washroom', 'Mens Washroom', 'Common area']
    }
  },
  'Business Management Building': {
    floors: ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'],
    rooms: {
      'Floor 1': ['Room 101', 'Room 102', 'Seminar Hall', 'Office 101'],
      'Floor 2': ['Room 201', 'Room 202', 'Conference Room', 'Office 201'],
      'Floor 3': ['Room 301', 'Room 302', 'Computer Lab', 'Office 301'],
    }
  },
  'Main Auditorium': {
    type: 'text'
  },
  'Sports Areas': {
    type: 'sports',
    locations: ['Badminton Court', 'Tennis Court', 'Basketball Court', 'Volleyball Court', 'Football Field', 'Gym Area']
  },
  'Outdoor Locations': {
    type: 'outdoor',
    locations: ['Juice Bar', 'Birdnest Area', 'Ground Area', 'Parking Lot', 'BM Canteen']
  },
  'Other': {
    type: 'text'
  }
};

const statusBadgeStyles = {
  OPEN: 'bg-red-50 text-red-600 border-red-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-600 border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  REJECTED: 'bg-slate-100 text-slate-500 border-slate-200'
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const IssueCard = ({ issue, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
      <span className={cn(
        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
        statusBadgeStyles[issue.status] || statusBadgeStyles.OPEN
      )}>
        {issue.status?.replace('_', ' ') || 'OPEN'}
      </span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{issue.category}</span>
    </div>

    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{issue.title}</h3>
    <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
      {issue.description}
    </p>

    {/* ✅ NEW: Show image thumbnails in card */}
    {issue.imageUrls && issue.imageUrls.length > 0 && (
      <div className="flex gap-1 mb-3">
        {issue.imageUrls.slice(0, 3).map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Preview"
            className="w-10 h-10 rounded-md object-cover border border-slate-200"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ))}
        {issue.imageUrls.length > 3 && (
          <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500">
            +{issue.imageUrls.length - 3}
          </div>
        )}
      </div>
    )}

    {/* ✅ NEW: Show document indicator */}
    {issue.supportingDocs && issue.supportingDocs.length > 0 && (
      <div className="flex items-center gap-1 mb-3 text-xs text-slate-500">
        <FileText size={12} />
        <span>{issue.supportingDocs.length} document(s)</span>
      </div>
    )}

    <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <MapPin size={14} />
          {issue.building || issue.locationText || '-'}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
          <Clock size={14} />
          {formatDate(issue.createdAt)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400">Assigned: {issue.assignedToName || 'Unassigned'}</span>
      </div>
    </div>
  </div>
);

const IssuesPage = () => {
  const { user } = useAuth();
  const isAdmin = useMemo(() => {
    if (!user) return false;
    return (user.roles || []).includes('ADMIN') || user.role === 'ADMIN';
  }, [user]);

  const [view, setView] = useState('list');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [supportingFiles, setSupportingFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState({});

  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    // building: '',
    // priority: '',
    // keyword: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'FACILITIES',
    description: '',
    building: '',
    floor: '',
    locationText: '',
    imageUrl: '',
    supportingDocs: '',
    academicIssueCategory: '',
    faculty: '',
    moduleCode: '',
    isOtherTitle: false,
    customTitle: ''
  });

  const getBuildingOptions = () => {
    if (formData.category === 'IT_SERVICES') {
      return BUILDING_OPTIONS_IT;
    }
    return BUILDING_OPTIONS_ALL;
  };

  const isBuildingWithFloors = (building) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    return buildingData && buildingData.floors;
  };

  const isBuildingWithLocations = (building) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    return buildingData && buildingData.locations;
  };

  const isBuildingWithTextInput = (building) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    return buildingData && buildingData.type === 'text';
  };

  const getRoomsForFloor = (building, floor) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    if (buildingData && buildingData.rooms && floor) {
      return buildingData.rooms[floor] || [];
    }
    return [];
  };

  const hasRoomsForFloor = (building, floor) => {
    const rooms = getRoomsForFloor(building, floor);
    return rooms && rooms.length > 0;
  };

  const isFloorRequired = (building) => {
    return isBuildingWithFloors(building);
  };

  const getFloorsForBuilding = (building) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    return buildingData && buildingData.floors ? buildingData.floors : [];
  };

  const getLocationsForBuilding = (building) => {
    const buildingData = LOCATION_OPTIONS_BY_BUILDING[building];
    return buildingData && buildingData.locations ? buildingData.locations : [];
  };

  const validateImageFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024;
    const errors = [];
    const validFiles = [];

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG and PNG formats are allowed`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File size must be less than 5MB`);
      } else {
        validFiles.push(file);
      }
    }

    return { validFiles, errors };
  };

  const validateSupportingFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;
    const errors = [];
    const validFiles = [];

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, PNG, and PDF formats are allowed`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File size must be less than 10MB`);
      } else {
        validFiles.push(file);
      }
    }

    return { validFiles, errors };
  };

  // Generate preview URLs for images
  const generatePreviews = (files) => {
    const previews = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
        };
        reader.readAsDataURL(file);
      }
    });
    return previews;
  };

  const [editData, setEditData] = useState(null);
  const [errors, setErrors] = useState({});
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState('COMMENT');
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ status: 'IN_PROGRESS', note: '', adminNotes: '' });

  const buildParams = (data) => Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );


  const loadIssues = async () => {
    try {
      setLoading(true);
      // Just load all issues - no filters needed in API call
      const data = await issueApi.getAll();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadIssueDetails = async (issueId) => {
    setDetailLoading(true);
    try {
      const data = await issueApi.getById(issueId);
      setSelectedIssue(data);
      const commentData = await issueApi.getComments(issueId);
      setComments(commentData);
    } catch (err) {
      console.error('Failed to load issue:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // Client-side filtering - runs when issues, searchTerm, or filters change
  useEffect(() => {
    let filtered = [...issues];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title?.toLowerCase().includes(term) ||
        issue.description?.toLowerCase().includes(term) ||
        issue.building?.toLowerCase().includes(term) ||
        issue.locationText?.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, filters.status, filters.category]);

  const validateForm = (payload) => {
    const nextErrors = {};

    if (!payload.category) {
      nextErrors.category = 'Category is required.';
    }

    if (!payload.description || payload.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    }

    if (payload.category === 'ACADEMIC') {
      if (!payload.academicIssueCategory) {
        nextErrors.academicIssueCategory = 'Please select an issue category.';
      }

      if (payload.academicIssueCategory === 'Other') {
        if (!payload.customTitle || payload.customTitle.trim().length < 5) {
          nextErrors.customTitle = 'Please specify the issue title (at least 5 characters).';
        }
      }

      if (!payload.faculty) {
        nextErrors.faculty = 'Please select a faculty.';
      }

      if (payload.moduleCode && payload.moduleCode.trim().length > 0) {
        if (payload.moduleCode.trim().length < 6) {
          nextErrors.moduleCode = 'Module code must be at least 6 characters if provided.';
        }
      }
    }
    else if (payload.category === 'SECURITY') {
      if (!payload.title || payload.title.trim().length < 5) {
        nextErrors.title = 'Title must be at least 5 characters.';
      }
    }
    else if (payload.category === 'OTHER') {
      if (!payload.title || payload.title.trim().length < 5) {
        nextErrors.title = 'Title must be at least 5 characters.';
      }
    }
    else {
      if (!payload.title || payload.title.trim().length < 5) {
        nextErrors.title = 'Title must be at least 5 characters.';
      }

      if (!payload.building) {
        nextErrors.building = 'Please select a building or location.';
      } else {
        if (isFloorRequired(payload.building)) {
          if (!payload.floor) {
            nextErrors.floor = 'Please select a floor.';
          }
          else if (hasRoomsForFloor(payload.building, payload.floor)) {
            if (!payload.locationText) {
              nextErrors.locationText = 'Please select a location.';
            }
          }
        }

        else if (isBuildingWithLocations(payload.building)) {
          if (!payload.locationText) {
            nextErrors.locationText = 'Please select a location.';
          }
        }
        else if (isBuildingWithTextInput(payload.building)) {
          if (!payload.locationText || !payload.locationText.trim()) {
            nextErrors.locationText = 'Please specify the location';
          } else if (payload.locationText.trim().length < 5) {
            nextErrors.locationText = 'Location must be at least 5 characters';
          }
        }
      }
    }
    return nextErrors;
  };

  const handleReportIssue = async () => {
    setErrors({});

    let finalTitle = formData.title;
    if (formData.category === 'ACADEMIC') {
      if (formData.academicIssueCategory === 'Other') {
        finalTitle = formData.customTitle;
      } else {
        finalTitle = formData.academicIssueCategory;
      }
    }

    // Convert images to Base64 strings
    const imageBase64 = await Promise.all(
      imageFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );

    // Convert supporting documents to Base64 strings
    const supportingDocsBase64 = await Promise.all(
      supportingFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({
            name: file.name,
            type: file.type,
            data: reader.result
          });
          reader.readAsDataURL(file);
        });
      })
    );

    let submissionData = {
      ...formData,
      title: finalTitle,
      imageUrls: imageBase64, // Changed from imageUrl to imageUrls array
      supportingDocs: supportingDocsBase64 // Changed from string to array of objects
    };

    if (formData.category === 'SECURITY' || formData.category === 'OTHER') {
      delete submissionData.building;
      delete submissionData.floor;
      delete submissionData.imageUrls;
      delete submissionData.supportingDocs;
      delete submissionData.academicIssueCategory;
      delete submissionData.faculty;
      delete submissionData.moduleCode;
      delete submissionData.isOtherTitle;
      delete submissionData.customTitle;
      submissionData.locationText = `${formData.category} issue`;
    }

    if (formData.category === 'ACADEMIC') {
      delete submissionData.building;
      delete submissionData.floor;
      delete submissionData.imageUrls;
      submissionData.locationText = `Academic issue: ${finalTitle}`;
    }

    // ✅ ADD THIS FOR DEBUGGING
    console.log('Submitting form data:', submissionData);
    console.log('Category:', formData.category);
    console.log('Final title:', finalTitle);


    const validationErrors = validateForm(submissionData);
    console.log('Validation errors:', validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      console.log('Sending to API:', submissionData);
      await issueApi.create(submissionData);
      setFormData({
        title: '',
        category: 'FACILITIES',
        description: '',
        building: '',
        floor: '',
        locationText: '',
        imageUrl: '',
        supportingDocs: '',
        academicIssueCategory: '',
        faculty: '',
        moduleCode: '',
        isOtherTitle: false,
        customTitle: ''
      });
      setImageFiles([]);
      setImagePreviews([]);
      setSupportingFiles([]);
      setFileErrors({});
      setView('list');
      loadIssues();
    } catch (err) {
      console.error('Reporting failed:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 400) {
        setErrors(err.response.data || {});
      } else {
        alert(err.response?.data?.message || 'Failed to report issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await issueApi.addComment(selectedIssue.id, {
        message: commentText.trim(),
        type: commentType
      });
      setCommentText('');
      const commentData = await issueApi.getComments(selectedIssue.id);
      setComments(commentData);
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAssign = async (userId) => {
    if (!selectedIssue) return;
    try {
      await issueApi.assign(selectedIssue.id, { assignedToUserId: userId });
      await loadIssueDetails(selectedIssue.id);
    } catch (err) {
      console.error('Assign failed:', err);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedIssue) return;
    try {
      await issueApi.updateStatus(selectedIssue.id, statusUpdate);
      await loadIssueDetails(selectedIssue.id);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleStartEdit = () => {
    setEditData({
      title: selectedIssue.title || '',
      category: selectedIssue.category || 'FACILITIES',
      description: selectedIssue.description || '',
      building: selectedIssue.building || '',
      locationText: selectedIssue.locationText || '',
      imageUrl: selectedIssue.imageUrls && selectedIssue.imageUrls.length > 0 ? selectedIssue.imageUrls[0] : '',
    });
    setErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    // Create a clean update payload - only send fields that exist
    const updatePayload = {};

    if (editData.title) updatePayload.title = editData.title;
    if (editData.category) updatePayload.category = editData.category;
    if (editData.description) updatePayload.description = editData.description;
    if (editData.building !== undefined) updatePayload.building = editData.building;
    if (editData.locationText !== undefined) updatePayload.locationText = editData.locationText;
    if (editData.imageUrl !== undefined) updatePayload.imageUrl = [editData.imageUrl];

    try {
      setLoading(true);
      await issueApi.update(selectedIssue.id, updatePayload);
      setEditData(null);
      setErrors({});
      await loadIssueDetails(selectedIssue.id);
      // Also refresh the main list in background
      loadIssues();
    } catch (err) {
      console.error('Update failed:', err);
      if (err.response?.status === 400) {
        setErrors(err.response.data || {});
      } else {
        alert(err.response?.data?.message || 'Failed to update issue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIssue) return;
    if (!window.confirm('Delete this issue? This action cannot be undone.')) return;
    try {
      await issueApi.remove(selectedIssue.id);
      setView('list');
      setSelectedIssue(null);
      loadIssues();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const canEdit = selectedIssue && (isAdmin || (user?.id === selectedIssue.createdByUserId && selectedIssue.status === 'OPEN'));
  const canDelete = canEdit;

  if (loading && view === 'list') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Scanning campus reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Campus Issue Reporter</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Help us maintain a better campus environment.</p>
        </div>

        {view === 'list' && (
          <button
            onClick={() => {
              setFormData({
                title: '',
                category: 'FACILITIES',
                description: '',
                building: '',
                floor: '',
                locationText: '',
                imageUrl: '',
                supportingDocs: '',
                academicIssueCategory: '',
                faculty: '',
                moduleCode: '',
                isOtherTitle: false,
                customTitle: ''
              });
              setImageFiles([]);
              setImagePreviews([]);
              setSupportingFiles([]);
              setFileErrors({});
              setErrors({});
              setView('report');
            }}
            className="px-8 py-4 bg-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            Report New Issue <AlertCircle size={18} />
          </button>
        )}
        {(view === 'report' || view === 'detail') && (
          <button
            onClick={() => {
              setView('list');
              setSelectedIssue(null);
              setEditData(null);

              setFormData({
                title: '',
                category: 'FACILITIES',
                description: '',
                building: '',
                floor: '',
                locationText: '',
                imageUrl: '',
                supportingDocs: '',
                academicIssueCategory: '',
                faculty: '',
                moduleCode: '',
                isOtherTitle: false,
                customTitle: ''
              });
              setImageFiles([]);
              setImagePreviews([]);
              setSupportingFiles([]);
              setFileErrors({});
              setErrors({});
            }}
            className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Back to Tracker
          </button>
        )}
      </div>

      {view === 'list' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by issue name or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}  // ✅ Just update searchTerm, no API call
                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-slate-700 shadow-sm"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });  // ✅ Just update state, no API call
              }}
              className="px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-slate-600"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });  // ✅ Just update state, no API call
              }}
              className="px-6 py-5 bg-white border border-slate-100 rounded-[32px] font-bold text-slate-600"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => {
                  setSelectedIssue(issue);
                  setView('detail');
                  loadIssueDetails(issue.id);
                }}
              />
            ))}
            {filteredIssues.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold">No campus issues match your search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="max-w-3xl mx-auto bg-white rounded-[40px] border border-slate-100 shadow-2xl p-12 animate-in zoom-in duration-300">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Report a campus issue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="field md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setFormData({
                    title: '',
                    category: newCategory,
                    description: '',
                    building: '',
                    floor: '',
                    locationText: '',
                    imageUrl: '',
                    supportingDocs: '',
                    academicIssueCategory: '',
                    faculty: '',
                    moduleCode: '',
                    isOtherTitle: false,
                    customTitle: ''
                  });
                  setImageFiles([]);
                  setImagePreviews([]);
                  setSupportingFiles([]);
                  setFileErrors({});
                  setErrors({});
                }}
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.category && 'border-red-500 bg-red-50'
                )}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>{category.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Academic Category Specific Fields */}
            {formData.category === 'ACADEMIC' && (
              <>
                {/* Issue Category Dropdown */}
                <div className="field">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Category</label>
                  <select
                    value={formData.academicIssueCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        academicIssueCategory: value,
                        isOtherTitle: value === 'Other',
                        customTitle: value === 'Other' ? formData.customTitle : ''
                      });
                      if (errors.academicIssueCategory) {
                        setErrors({ ...errors, academicIssueCategory: undefined });
                      }
                    }}
                    className={cn(
                      'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                      errors.academicIssueCategory && 'border-red-500 bg-red-50'
                    )}
                  >
                    <option value="">Select Issue Category</option>
                    {ACADEMIC_ISSUE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.academicIssueCategory && <p className="text-xs text-red-500 mt-1 ml-1">{errors.academicIssueCategory}</p>}
                </div>

                {/* Custom Title Input for "Other" */}
                {formData.academicIssueCategory === 'Other' && (
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specify Issue Title</label>
                    <input
                      type="text"
                      value={formData.customTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, customTitle: e.target.value });
                        if (errors.customTitle) {
                          setErrors({ ...errors, customTitle: undefined });
                        }
                      }}
                      placeholder="Enter the issue title..."
                      className={cn(
                        'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                        errors.customTitle && 'border-red-500 bg-red-50'
                      )}
                    />
                    {errors.customTitle && <p className="text-xs text-red-500 mt-1 ml-1">{errors.customTitle}</p>}
                  </div>
                )}

                {/* Faculty Dropdown */}
                <div className="field">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Faculty</label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => {
                      setFormData({ ...formData, faculty: e.target.value });
                      if (errors.faculty) {
                        setErrors({ ...errors, faculty: undefined });
                      }
                    }}
                    className={cn(
                      'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                      errors.faculty && 'border-red-500 bg-red-50'
                    )}
                  >
                    <option value="">Select Faculty</option>
                    {FACULTY_OPTIONS.map((faculty) => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                  {errors.faculty && <p className="text-xs text-red-500 mt-1 ml-1">{errors.faculty}</p>}
                </div>

                {/* Module Code Input */}
                <div className="field">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Module Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.moduleCode}
                    onChange={(e) => {
                      setFormData({ ...formData, moduleCode: e.target.value });
                      if (errors.moduleCode) {
                        setErrors({ ...errors, moduleCode: undefined });
                      }
                    }}
                    placeholder="Enter Module Code"
                    className={cn(
                      'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                      errors.moduleCode && 'border-red-500 bg-red-50'
                    )}
                  />
                  {errors.moduleCode && <p className="text-xs text-red-500 mt-1 ml-1">{errors.moduleCode}</p>}
                </div>
              </>
            )}

            {/* Title field for non-academic categories */}
            {formData.category !== 'ACADEMIC' && (
              <div className="field">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Issue Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) {
                      setErrors({ ...errors, title: undefined });
                    }
                  }}
                  placeholder="Tell us your issue"
                  className={cn(
                    'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                    errors.title && 'border-red-500 bg-red-50'
                  )}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
              </div>
            )}

            {/* Location fields for FACILITIES and IT_SERVICES only */}
            {(formData.category === 'FACILITIES' || formData.category === 'IT_SERVICES') && (
              <>
                {/* Building / Location Selection */}
                <div className="field">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Building</label>
                  <select
                    value={formData.building}
                    onChange={(e) => {
                      const nextBuilding = e.target.value;
                      setFormData({
                        ...formData,
                        building: nextBuilding,
                        floor: '',
                        locationText: ''
                      });
                      setErrors({
                        ...errors,
                        building: undefined,
                        floor: undefined,
                        locationText: undefined
                      });
                    }}
                    className={cn(
                      'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                      errors.building && 'border-red-500 bg-red-50'
                    )}
                  >
                    <option value="">Select building or location</option>
                    {getBuildingOptions().map((building) => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                  {errors.building && <p className="text-xs text-red-500 mt-1 ml-1">{errors.building}</p>}
                </div>

                {/* Floor Selection */}
                {formData.building && isBuildingWithFloors(formData.building) && (
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Floor</label>
                    <select
                      value={formData.floor}
                      onChange={(e) => {
                        const floor = e.target.value;
                        setFormData({
                          ...formData,
                          floor: floor,
                          locationText: ''
                        });
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          floor: undefined,
                          locationText: undefined
                        }));
                      }}
                      className={cn(
                        'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                        errors.floor && 'border-red-500 bg-red-50'
                      )}
                    >
                      <option value="">Select floor</option>
                      {getFloorsForBuilding(formData.building).map((floor) => (
                        <option key={floor} value={floor}>{floor}</option>
                      ))}
                    </select>
                    {errors.floor && <p className="text-xs text-red-500 mt-1 ml-1">{errors.floor}</p>}
                  </div>
                )}

                {/* Location Selection */}
                {formData.building && isBuildingWithFloors(formData.building) && formData.floor && hasRoomsForFloor(formData.building, formData.floor) && (
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Location</label>
                    <select
                      value={formData.locationText}
                      onChange={(e) => {
                        setFormData({ ...formData, locationText: e.target.value });
                        if (errors.locationText) {
                          setErrors((prevErrors) => ({ ...prevErrors, locationText: undefined }));
                        }
                      }}

                      className={cn(
                        'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                        errors.locationText && 'border-red-500 bg-red-50'
                      )}
                    >
                      <option value="">Select location</option>
                      {getRoomsForFloor(formData.building, formData.floor).map((room) => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                    {errors.locationText && <p className="text-xs text-red-500 mt-1 ml-1">{errors.locationText}</p>}
                  </div>
                )}

                {/* Message for floors without rooms */}
                {formData.building && isBuildingWithFloors(formData.building) && formData.floor && !hasRoomsForFloor(formData.building, formData.floor) && (
                  <div className="field">
                    <div className="w-full px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
                      <p className="text-amber-700 font-medium text-sm">
                        📍 This floor has no specific locations. Please describe the exact location in the description field above.
                      </p>
                    </div>
                  </div>
                )}

                {/* Simple Location List */}
                {formData.building && isBuildingWithLocations(formData.building) && (
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Location</label>
                    <select
                      value={formData.locationText}
                      onChange={(e) => {
                        setFormData({ ...formData, locationText: e.target.value });
                        if (errors.locationText) {
                          setErrors((prevErrors) => ({ ...prevErrors, locationText: undefined }));
                        }
                      }}
                      className={cn(
                        'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                        errors.locationText && 'border-red-500 bg-red-50'
                      )}
                    >
                      <option value="">Select location</option>
                      {getLocationsForBuilding(formData.building).map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.locationText && <p className="text-xs text-red-500 mt-1 ml-1">{errors.locationText}</p>}
                  </div>
                )}

                {/* Text Input for Main Auditorium and Other */}
                {formData.building && isBuildingWithTextInput(formData.building) && (
                  <div className="field">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specify Location</label>
                    <input
                      type="text"
                      value={formData.locationText}
                      onChange={(e) => {
                        setFormData({ ...formData, locationText: e.target.value });
                        if (errors.locationText) {
                          setErrors((prevErrors) => ({ ...prevErrors, locationText: undefined }));
                        }
                      }}
                      placeholder="Enter Specific Location"
                      className={cn(
                        'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                        errors.locationText && 'border-red-500 bg-red-50'
                      )}
                    />
                    {errors.locationText && <p className="text-xs text-red-500 mt-1 ml-1">{errors.locationText}</p>}
                  </div>
                )}
              </>
            )}

            {/* Description Field - After location fields */}
            <div className="field md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: undefined });
                  }
                }}
                rows="4"
                placeholder="Tell us exactly what's wrong..."
                className={cn(
                  'w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none',
                  errors.description && 'border-red-500 bg-red-50'
                )}
              ></textarea>
              {errors.description && <p className="text-xs text-red-500 mt-1 ml-1">{errors.description}</p>}
            </div>

            {/* Image Upload - For all categories except Academic */}
            {formData.category !== 'ACADEMIC' && (
              <div className="field">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Images (Optional - JPEG, PNG only, up to 5MB each)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const { validFiles, errors } = validateImageFiles(files);

                      if (errors.length > 0) {
                        setFileErrors({ ...fileErrors, images: errors });
                        setTimeout(() => setFileErrors({ ...fileErrors, images: [] }), 5000);
                      }

                      if (validFiles.length > 0) {
                        setImageFiles(prev => [...prev, ...validFiles]);
                        // ✅ FIXED: Generate previews properly
                        const newPreviews = [];
                        validFiles.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            newPreviews.push(reader.result);
                            if (newPreviews.length === validFiles.length) {
                              setImagePreviews(prev => [...prev, ...newPreviews]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                      e.target.value = ''; // Reset input
                    }}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none"
                  />
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                            setImageFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fileErrors.images && (
                  <div className="mt-2 text-xs text-red-500">
                    {fileErrors.images.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                )}
              </div>
            )}

            {/* Supporting Documents - Only for Academic category */}
            {formData.category === 'ACADEMIC' && (
              <div className="field">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Supporting Documents (Optional - JPEG, PNG, PDF, up to 10MB each)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const { validFiles, errors } = validateSupportingFiles(files);

                      if (errors.length > 0) {
                        setFileErrors({ ...fileErrors, supportingDocs: errors });
                        setTimeout(() => setFileErrors({ ...fileErrors, supportingDocs: [] }), 5000);
                      }

                      if (validFiles.length > 0) {
                        setSupportingFiles(prev => [...prev, ...validFiles]);
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-primary transition-all font-bold outline-none pl-12"
                  />
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>

                {/* File List */}
                {supportingFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {supportingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          {file.type === 'application/pdf' ? (
                            <FileText size={16} className="text-red-500" />
                          ) : (
                            <Image size={16} className="text-green-500" />
                          )}
                          <span className="text-sm text-slate-600 truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSupportingFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fileErrors.supportingDocs && (
                  <div className="mt-2 text-xs text-red-500">
                    {fileErrors.supportingDocs.map((err, i) => <p key={i}>{err}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => {
                setView('list');
                setFormData({
                  title: '',
                  category: 'FACILITIES',
                  description: '',
                  building: '',
                  floor: '',
                  locationText: '',
                  imageUrl: '',
                  supportingDocs: '',
                  academicIssueCategory: '',
                  faculty: '',
                  moduleCode: '',
                  isOtherTitle: false,
                  customTitle: ''
                });
                setImageFiles([]);
                setImagePreviews([]);
                setSupportingFiles([]);
                setFileErrors({});
                setErrors({});
              }}
              className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleReportIssue}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30"
            >
              Submit Report <ArrowRight className="inline ml-2" size={16} />
            </button>
          </div>
        </div>
      )}

      {view === 'detail' && selectedIssue && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm space-y-8">
              <div className="flex flex-wrap items-center gap-4">
                <span className={cn('px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border', statusBadgeStyles[selectedIssue.status] || statusBadgeStyles.OPEN)}>
                  {selectedIssue.status}
                </span>
                {selectedIssue.assignedToName && (
                  <span className="px-5 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest">Assigned: {selectedIssue.assignedToName}</span>
                )}
              </div>

              <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedIssue.title}</h2>

              <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><UserIcon size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reporter</span>
                    <span className="font-bold text-slate-900">{selectedIssue.createdByName || 'Student'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><Clock size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reported At</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedIssue.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><MapPin size={24} /></div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</span>
                    <span className="font-bold text-slate-900">{selectedIssue.building || selectedIssue.locationText || '-'}</span>
                  </div>
                </div>
              </div>

              {selectedIssue.imageUrls && selectedIssue.imageUrls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedIssue.imageUrls.map((img, index) => (
                      <div key={index} className="rounded-xl border border-slate-100 overflow-hidden">
                        <img
                          src={img}
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(img, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ NEW: Display supporting documents (PDFs and images) */}
              {selectedIssue.supportingDocs && selectedIssue.supportingDocs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">Supporting Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedIssue.supportingDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          {doc.type === 'application/pdf' ? (
                            <FileText size={24} className="text-red-500" />
                          ) : doc.type?.startsWith('image/') ? (
                            <Image size={24} className="text-green-500" />
                          ) : (
                            <Upload size={24} className="text-slate-500" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900 truncate max-w-[200px]">{doc.name || `Document ${index + 1}`}</p>
                            <p className="text-xs text-slate-500">{doc.type?.split('/')[1]?.toUpperCase() || 'File'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(doc.data, '_blank')}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-600 leading-loose text-lg">{selectedIssue.description}</p>
              </div>

              {selectedIssue.adminNotes && (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Admin Notes</h4>
                  <p className="text-slate-600">{selectedIssue.adminNotes}</p>
                </div>
              )}

              {canEdit && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleStartEdit}
                    className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                  >
                    <Pencil size={16} /> Edit Issue
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="px-5 py-3 bg-white text-red-600 border border-red-200 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              )}

              {editData && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20', errors.title && 'border-red-500')}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <textarea
                      rows="3"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20', errors.description && 'border-red-500')}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Building</label>
                    <input
                      value={editData.building}
                      onChange={(e) => setEditData({ ...editData, building: e.target.value })}
                      className={cn('w-full px-4 py-3 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20', errors.building && 'border-red-500')}
                    />
                    {errors.building && <p className="text-xs text-red-500 mt-1">{errors.building}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
                    <input
                      value={editData.locationText}
                      onChange={(e) => setEditData({ ...editData, locationText: e.target.value })}
                      className="w-full px-4 py-3 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setEditData(null);
                        setErrors({});
                      }}
                      className="flex-1 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={loading}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-12 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Clock className="text-slate-400" /> Timeline & Comments
              </h3>
              {detailLoading ? (
                <p className="text-slate-400">Loading timeline...</p>
              ) : (
                <div className="space-y-6">
                  {comments.length === 0 && (
                    <p className="text-sm text-slate-400">No updates yet.</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comment.userName || 'User'}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{comment.type?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{comment.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 border-t border-slate-100 pt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Comment</label>
                <textarea
                  rows="3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium"
                ></textarea>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  {isAdmin && (
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value)}
                      className="px-4 py-2 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600"
                    >
                      <option value="COMMENT">Comment</option>
                      <option value="NOTE">Admin Note</option>
                    </select>
                  )}
                  <button
                    onClick={handleAddComment}
                    disabled={commentLoading}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    {commentLoading ? 'Posting...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[40px] p-12 text-white shadow-2xl">
              <h3 className="text-2xl font-black mb-6">Admin Actions</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {isAdmin ? 'Assign issues, update status, and add admin notes.' : 'Admins only.'}
              </p>

              {isAdmin ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign To User ID</label>
                    <input
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      placeholder="User ID"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    />
                    <button
                      onClick={() => handleAssign(assignUserId || user?.id)}
                      className="w-full py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                    >
                      Assign Issue
                    </button>
                    <button
                      onClick={() => handleAssign(user?.id)}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20"
                    >
                      Assign to Me
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="text-slate-900">{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <textarea
                      rows="2"
                      value={statusUpdate.note}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                      placeholder="Status change note"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    ></textarea>
                    <textarea
                      rows="2"
                      value={statusUpdate.adminNotes}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, adminNotes: e.target.value })}
                      placeholder="Admin notes"
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-2xl border border-white/20"
                    ></textarea>
                    <button
                      onClick={handleStatusChange}
                      className="w-full py-3 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <BadgeCheck size={18} /> Admin privileges required
                </div>
              )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
                <Shield size={32} />
              </div>
              <h4 className="font-black text-slate-900 mb-2">Campus Shield</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">Reports are reviewed by Facilities Management. Serious security threats should be reported directly to Campus Security.</p>
              <button className="text-primary font-bold hover:underline">View Emergency Contacts</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;