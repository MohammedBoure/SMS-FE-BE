import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardCard from "../components/dashboard/DashboardCard";
import { loadTeacherDashboardData } from "../api";

/**
 * Teacher Dashboard Page
 * Role-based dashboard built from reusable layout components
 */

const sidebarLabels = [
  "Classes",
  "Schedule",
  "Attendance",
  "Marks",
  "Resources",
  "Administration Posts",
  "Messaging",
  "Notifications",
];

const sectionMeta = {
  Classes: {
    title: "Classes",
    description: "View assigned classes and occupancy details.",
  },
  Schedule: {
    title: "Schedule",
    description: "Review today’s timetable and upcoming sessions.",
  },
  Attendance: {
    title: "Attendance",
    description: "Check attendance records and summary statistics.",
  },
  Marks: {
    title: "Marks",
    description: "Inspect recent grades and assessment performance.",
  },
  Resources: {
    title: "Resources",
    description: "Browse uploaded teaching resources and attachments.",
  },
  "Administration Posts": {
    title: "Administration Posts",
    description: "Read the latest school announcements and updates.",
  },
  Messaging: {
    title: "Messaging",
    description: "Open recent conversations and new messages.",
  },
  Notifications: {
    title: "Notifications",
    description: "Review alerts and system notifications.",
  },
};

const buildSidebarItems = (activeLabel) =>
  sidebarLabels.map((label) => ({
    label,
    active: label === activeLabel,
  }));

const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return "Time unavailable";
  }

  return `${String(startTime).slice(0, 5)} - ${String(endTime).slice(0, 5)}`;
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Classes");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/login");
      return undefined;
    }

    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await loadTeacherDashboardData(currentUser);
        if (!isMounted) {
          return;
        }

        if (!data?.teacher) {
          throw new Error("Teacher profile not found for this account.");
        }

        setDashboard(data);
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [currentUser, navigate]);

  const sidebarItems = useMemo(
    () => buildSidebarItems(activeSection),
    [activeSection],
  );

  const teacherName =
    dashboard?.teacher?.full_name || currentUser?.full_name || "Teacher User";
  const teacherAssignments = dashboard?.assignments || [];
  const teacherSchedule = dashboard?.schedule || [];
  const classesOccupancy = dashboard?.classesOccupancy || [];
  const messages = dashboard?.messages || [];
  const notifications = dashboard?.notifications || [];
  const posts = dashboard?.posts || [];
  const resources = dashboard?.resources || [];
  const grades = dashboard?.grades || [];
  const classAttendance = dashboard?.classAttendance || [];
  const assessmentStats = dashboard?.assessmentStats || {
    total_grades: 0,
    average_grade: 0,
    highest_grade: 0,
    lowest_grade: 0,
  };

  const assignedClasses = classesOccupancy.filter((classItem) =>
    teacherAssignments.some(
      (assignment) => assignment.class_id === classItem.id,
    ),
  );

  const attendanceSummary = useMemo(() => {
    const totalStudents = classAttendance.length;
    const recorded = classAttendance.filter((item) => item.status);

    return {
      totalStudents,
      recordedCount: recorded.length,
      pendingCount: totalStudents - recorded.length,
      presentCount: recorded.filter((item) => item.status === "present").length,
      absentCount: recorded.filter((item) => item.status === "absent").length,
      lateCount: recorded.filter((item) => item.status === "late").length,
      justifiedAbsences: recorded.filter(
        (item) => item.status === "absent" && item.is_justified,
      ).length,
    };
  }, [classAttendance]);

  const topMarks = grades.slice(0, 3);
  const latestMessages = messages.slice(0, 3);
  const latestNotifications = notifications.slice(0, 3);
  const latestPosts = posts.slice(0, 2);
  const latestResources = resources.slice(0, 2);

  const sectionTitle = sectionMeta[activeSection]?.title || activeSection;
  const sectionDescription = sectionMeta[activeSection]?.description || "";

  const renderSectionContent = () => {
    switch (activeSection) {
      case "Classes":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Classes Overview">
              <div className="space-y-3">
                {assignedClasses.length ? (
                  assignedClasses.map((classItem) => {
                    const capacity = classItem.capacity || 1;
                    const current = classItem.current_student_count || 0;
                    const remaining = classItem.remaining_seats ?? 0;
                    const occupancy = Math.min(100, (current / capacity) * 100);

                    return (
                      <div
                        key={classItem.id}
                        className="rounded-lg bg-surfaceLight px-3 py-2 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-textPrimary">
                            {classItem.class_name}
                          </span>
                          <span className="text-xs text-textSecondary">
                            {classItem.level || "Level n/a"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-textSecondary">
                          <span>{current} students</span>
                          <span>{remaining} seats left</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-textSecondary">
                          <span>Capacity {capacity}</span>
                          <span>{occupancy.toFixed(0)}% occupied</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-textSecondary">
                    No assigned classes found.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Class Highlights">
              <div className="space-y-3">
                {assignedClasses.length ? (
                  assignedClasses.slice(0, 3).map((classItem) => (
                    <div
                      key={classItem.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {classItem.class_name}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {classItem.current_student_count || 0} active students
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No class highlights available.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        );

      case "Schedule":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Today’s Schedule">
              <div className="space-y-3">
                {teacherSchedule.length ? (
                  teacherSchedule.slice(0, 4).map((item) => (
                    <div
                      key={item.schedule_id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {item.subject_name}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {item.class_name} • {item.level}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {item.day_of_week} •{" "}
                        {formatTimeRange(item.start_time, item.end_time)}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {item.room_number || "Room n/a"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No schedule entries available.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Workload Snapshot">
              <div className="space-y-3">
                <div className="rounded-lg bg-surfaceLight px-3 py-2">
                  <p className="text-xs text-textSecondary">Assignments</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {teacherAssignments.length}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight px-3 py-2">
                  <p className="text-xs text-textSecondary">Schedule entries</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {teacherSchedule.length}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        );

      case "Attendance":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Attendance Summary">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Students</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.totalStudents}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Recorded</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.recordedCount}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Present</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.presentCount}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Absent</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.absentCount}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Late</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.lateCount}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Justified</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {attendanceSummary.justifiedAbsences}
                  </p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Class Attendance Sheet">
              <div className="space-y-3">
                {classAttendance.length ? (
                  classAttendance.slice(0, 6).map((row) => (
                    <div
                      key={row.student_id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-textPrimary">
                          {row.student_name}
                        </p>
                        <p className="text-xs text-textSecondary">
                          {row.status || "pending"}
                        </p>
                      </div>
                      <p className="text-xs text-textSecondary">
                        {row.is_justified ? "Justified" : "Not justified"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No attendance sheet loaded.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        );

      case "Marks":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Recent Marks">
              <div className="space-y-3">
                {topMarks.length ? (
                  topMarks.map((mark) => (
                    <div
                      key={mark.grade_id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-textPrimary">
                          {mark.student_name}
                        </span>
                        <span className="text-sm text-textPrimary">
                          {mark.grade_value}/{mark.max_grade}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary">
                        {dashboard?.recentAssessment?.title || "Assessment"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No marks loaded yet.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Assessment Snapshot">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Evaluations</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {assessmentStats.total_grades || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Average</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {assessmentStats.average_grade || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Highest</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {assessmentStats.highest_grade || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight p-3">
                  <p className="text-xs text-textSecondary">Lowest</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {assessmentStats.lowest_grade || 0}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        );

      case "Resources":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Latest Resources">
              <div className="space-y-3">
                {latestResources.length ? (
                  latestResources.map((resource) => (
                    <div
                      key={resource.resource_id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {resource.title}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {resource.subject_name || "General"} •{" "}
                        {resource.class_name || "All classes"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No resources available.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Resource Types">
              <div className="space-y-3">
                {resources.length ? (
                  resources.slice(0, 4).map((resource) => (
                    <div
                      key={resource.resource_id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {resource.resource_type}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {resource.file_path_or_url}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No resource records available.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        );

      case "Administration Posts":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Administration Posts">
              <div className="space-y-3">
                {latestPosts.length ? (
                  latestPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {post.title}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {post.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No posts available.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Post Authors">
              <div className="space-y-3">
                {posts.length ? (
                  posts.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {post.author_name || post.username || "Unknown author"}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {post.created_at}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No author records available.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        );

      case "Messaging":
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Messages">
              <div className="space-y-3">
                {latestMessages.length ? (
                  latestMessages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {message.sender_name}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {message.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No messages available.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Inbox Snapshot">
              <div className="space-y-3">
                {messages.length ? (
                  messages.slice(0, 4).map((message) => (
                    <div
                      key={message.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {message.receiver_name || message.sender_name}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {message.created_at}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No inbox data available.
                  </p>
                )}
              </div>
            </DashboardCard>
          </div>
        );

      case "Notifications":
      default:
        return (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <DashboardCard title="Notifications">
              <div className="space-y-3">
                {latestNotifications.length ? (
                  latestNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-lg bg-surfaceLight px-3 py-2 space-y-1"
                    >
                      <p className="text-sm font-medium text-textPrimary">
                        {notification.title}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {notification.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textSecondary">
                    No notifications available.
                  </p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Notification Status">
              <div className="space-y-3">
                <div className="rounded-lg bg-surfaceLight px-3 py-2">
                  <p className="text-xs text-textSecondary">Unread count</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {notifications.filter((item) => !item.is_read).length}
                  </p>
                </div>
                <div className="rounded-lg bg-surfaceLight px-3 py-2">
                  <p className="text-xs text-textSecondary">Total loaded</p>
                  <p className="text-xl font-semibold text-textPrimary">
                    {notifications.length}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      userName={teacherName}
      sidebarItems={sidebarItems}
      onSidebarItemClick={(item) => setActiveSection(item.label)}
    >
      {loading ? (
        <DashboardCard title="Loading dashboard...">
          <p className="text-sm text-textSecondary">
            Fetching classes, schedule, attendance, marks, messages, and
            notifications.
          </p>
        </DashboardCard>
      ) : error ? (
        <DashboardCard title="Dashboard unavailable">
          <p className="text-sm text-danger">{error}</p>
        </DashboardCard>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-textPrimary">
              {sectionTitle}
            </h2>
            {sectionDescription && (
              <p className="text-sm text-textSecondary">{sectionDescription}</p>
            )}
          </div>

          {renderSectionContent()}
        </div>
      )}
    </DashboardLayout>
  );
}
