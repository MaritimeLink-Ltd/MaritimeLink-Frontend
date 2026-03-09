import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronLeft } from 'lucide-react';
import { saveOrUpdateSession } from '../../../../utils/trainingSessionsStore';

export default function ScheduleSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const isEdit = location.state?.isEdit || false;
  const sessionData = location.state?.sessionData || null;

  const [form, setForm] = useState({
    startDate: sessionData?.startDate || '',
    endDate: sessionData?.endDate || '',
    location: sessionData?.location || '',
    seatCapacity: sessionData?.totalSeats || '',
    enrollmentDeadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const eventDate = [form.startDate, form.endDate].filter(Boolean).join(' - ');

    saveOrUpdateSession(
      courseId,
      {
        eventDate,
        location: form.location,
        totalSeats: form.seatCapacity,
        bookedSeats: sessionData?.bookedSeats || 0
      },
      {
        sessionId: isEdit ? sessionData?.id : null
      }
    );

    navigate(`/trainingprovider/courses/${courseId || '1'}/sessions`);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="max-w-6xl mx-auto w-full p-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Sessions
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
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-[#003971] text-white font-semibold text-sm hover:bg-[#002455] transition-all shadow-sm"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
