import Navbar from "../components/Navbar";
import Card from "../components/Card";

/**
 * Home Page
 * Landing page with hero section and features grid
 */

export default function HomePage() {
  const features = [
    {
      title: "Academic Excellence",
      description:
        "Rigorous curriculum designed to develop critical thinking and academic mastery.",
    },
    {
      title: "Modern Facilities",
      description:
        "State-of-the-art classrooms, laboratories, and technology centers.",
    },
    {
      title: "Experienced Teachers",
      description:
        "Highly qualified educators committed to student success and growth.",
    },
    {
      title: "Student Support",
      description:
        "Comprehensive counseling and mentoring programs for every student.",
    },
    {
      title: "Extracurricular Activities",
      description:
        "Diverse clubs, sports, and cultural programs to nurture talents.",
    },
    {
      title: "Digital Learning",
      description:
        "Integrated technology-enhanced learning environment for 21st-century skills.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-textPrimary mb-4">
            Welcome to Our School
          </h2>
          <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
            A premier institution dedicated to fostering academic excellence,
            personal growth, and leadership in a supportive and innovative
            environment.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <section className="px-4 sm:px-6 py-12" />
    </div>
  );
}

