import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronLeft, BookOpen, ChevronDown, Search } from 'lucide-react';
import { publishedCourses } from '../../../../data/publishedCoursesData';
import httpClient from '../../../../utils/httpClient';
import { API_ENDPOINTS } from '../../../../config/api.config';

export default function ScheduleSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const isEdit = location.state?.isEdit || false;
  const sessionData = location.state?.sessionData || null;
  const passedCourseTitle = location.state?.courseTitle || '';
  const returnPath = location.state?.returnPath;
  const lockCourseSelection = Boolean(courseId);

  const goBack = () => {
    if (returnPath) navigate(returnPath);
    else navigate(-1);
  };

  const [selectedCourse, setSelectedCourse] = useState(courseId || sessionData?.courseId || '');
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const courseDropdownRef = useRef(null);
  const courseSearchRef = useRef(null);

  const [form, setForm] = useState({
    startDate: sessionData?.startDate || '',
    endDate: sessionData?.endDate || '',
    location: sessionData?.location || '',
    seatCapacity: sessionData?.totalSeats || '',
    enrollmentDeadline: ''
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
        setCourseDropdownOpen(false);
        setCourseSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus the search input when dropdown opens
  useEffect(() => {
    if (courseDropdownOpen && courseSearchRef.current) {
      courseSearchRef.current.focus();
    }
  }, [courseDropdownOpen]);

  const filteredCourses = publishedCourses.filter((c) =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const selectedCourseName = passedCourseTitle || publishedCourses.find((c) => String(c.id) === String(selectedCourse))?.name || '';

  const handleSelectCourse = (course) => {
    setSelectedCourse(course.id);
    setCourseDropdownOpen(false);
    setCourseSearch('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const targetCourseId = selectedCourse || courseId;

      const sessionPayload = {
          startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date().toISOString(),
          startTime: "09:00",
          endTime: "17:00",
          location: form.location || 'Online',
          instructor: "TBD",
          totalSeats: Number(form.seatCapacity) || 0
      };

      if (isEdit) {
          await httpClient.patch(
              API_ENDPOINTS.COURSES.UPDATE_SESSION(sessionData.id),
              sessionPayload
          );
      } else {
          await httpClient.post(
              API_ENDPOINTS.COURSES.CREATE_SESSION(targetCourseId),
              sessionPayload
          );
      }

      goBack();
    } catch (error) {
      console.error('Failed to schedule session', error);
      alert('Failed to schedule session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-6xl mx-auto w-full p-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {lockCourseSelection ? 'Back to course' : 'Back to Sessions'}
          </button>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Session' : 'Schedule New Session'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEdit ? 'Update the training session details.' : 'Create a new training session for this course.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Select Course — Searchable Dropdown */}
            <div ref={courseDropdownRef} className="relative">
              <label className="block text-gray-900 font-medium mb-2 text-base">Course</label>
              {lockCourseSelection ? (
                <div className="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-900">
                  <BookOpen className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="font-medium">{selectedCourseName || 'This course'}</span>
                  <span className="text-xs text-gray-500 ml-auto">Sessions are added for this listing</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    id="select-course"
                    onClick={() => setCourseDropdownOpen((prev) => !prev)}
                    className={`relative w-full flex items-center border rounded-xl pl-10 pr-10 py-3 text-sm text-left bg-white cursor-pointer transition-all ${courseDropdownOpen
                        ? 'border-[#003971] ring-2 ring-[#003971]/15'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <span className={selectedCourseName ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedCourseName || '-- Select a Course --'}
                    </span>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${courseDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {courseDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="relative px-3 pt-3 pb-2">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={courseSearchRef}
                          type="text"
                          placeholder="Search courses..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <li
                              key={course.id}
                              onClick={() => handleSelectCourse(course)}
                              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${String(course.id) === String(selectedCourse)
                                  ? 'bg-[#EBF3FF] text-[#003971] font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {course.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-sm text-gray-400 text-center">No courses found</li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-900">Session Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-base">Start Date</label>
                <div className="relative">
                  <input
                    type="text"
                    name="startDate"
                    placeholder="e.g. Jun 10, 2024"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-gray-900 font-medium mb-2 text-base">End Date</label>
                <div className="relative">
                  <input
                    type="text"
                    name="endDate"
                    placeholder="e.g. Jun 12, 2024"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2 text-base">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  placeholder="Enter session location (city or facility)"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2 text-base">Seat Capacity</label>
              <p className="text-xs text-gray-500 mb-1">
                Specify the maximum number of seats available for the session.
              </p>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="seatCapacity"
                  placeholder="e.g. 16"
                  value={form.seatCapacity}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2 text-base">Enrollment Deadline</label>
              <div className="relative">
                <input
                  type="text"
                  name="enrollmentDeadline"
                  placeholder="Set deadline for enrollment"
                  value={form.enrollmentDeadline}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971]/15 focus:border-[#003971] placeholder-gray-400"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-between">
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-75"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm disabled:opacity-75"
              >
                {isLoading ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
