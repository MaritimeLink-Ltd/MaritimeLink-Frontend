import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, ChevronLeft, CheckCircle } from 'lucide-react';
import { saveOrUpdateSession } from '../../../../utils/trainingSessionsStore';

export default function ScheduleSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const isEdit = location.state?.isEdit || false;
  const sessionData = location.state?.sessionData || null;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({
    startDate: sessionData?.startDate || '',
    endDate: sessionData?.endDate || '',
    startTime: sessionData?.startTime || '',
    endTime: sessionData?.endTime || '',
    location: sessionData?.location || 'Training Center A',
    instructor: sessionData?.instructor || 'Jane Cooper',
    totalSeats: sessionData?.totalSeats || 20,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventDate = [form.startDate, form.endDate].filter(Boolean).join(' - ');

    saveOrUpdateSession(
      courseId,
      {
        eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        instructor: form.instructor,
        totalSeats: form.totalSeats,
        bookedSeats: sessionData?.bookedSeats || 0
      },
      {
        sessionId: isEdit ? sessionData?.id : null
      }
    );

    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate(`/trainingprovider/courses/${courseId || '1'}/sessions`);
  };

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </button>
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">{isEdit ? 'Edit Session' : 'Schedule New Session'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Update the training session details.' : 'Create a new training session for this course.'}</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Session Schedule Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-[#003971]" />
                <h2 className="font-bold text-gray-900">Session Schedule</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="text"
                    name="startDate"
                    placeholder="dd/mm/yyyy"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="text"
                    name="endDate"
                    placeholder="dd/mm/yyyy"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="text"
                    name="startTime"
                    placeholder="hh:mm"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="text"
                    name="endTime"
                    placeholder="hh:mm"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Location & Instructor Section */}
            <div className="pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-6 mt-8">
                <MapPin className="h-5 w-5 text-[#003971]" />
                <h2 className="font-bold text-gray-900">Location & Instructor</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Instructor</label>
                  <input
                    type="text"
                    name="instructor"
                    value={form.instructor}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Capacity Section */}
            <div className="pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2 mb-6 mt-8">
                <Users className="h-5 w-5 text-[#003971]" />
                <h2 className="font-bold text-gray-900">Capacity</h2>
              </div>

              <div className="w-full md:w-1/2 pr-0 md:pr-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={form.totalSeats}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003971] focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100 mt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#003971] text-white hover:bg-[#002855] transition-colors shadow-sm"
              >
                {isEdit ? 'Update Session' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{isEdit ? 'Session Updated Successfully!' : 'Session Created Successfully!'}</h2>
              <p className="text-gray-600">
                {isEdit ? 'Your training session has been updated successfully.' : 'Your new training session has been scheduled and is now available.'}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full px-6 py-3 bg-[#003971] text-white rounded-lg font-semibold hover:bg-[#002855] transition-colors"
            >
              Go to Manage Sessions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
