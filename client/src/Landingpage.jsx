import React, { useState, useEffect } from "react";
import heroImage from "./image.png";
import { BASE_URL } from "./config";
import Announcements from "./components/Announcements";
import { Map, Smartphone, BarChart, Users, School, Zap, Waves, Church, Store } from 'lucide-react';
import Footer from "./components/Footer";

function Landingpage({ onLoginClick }) {
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/activities`);
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        // Display the 4 most recent activities
        setActivities(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching activities for landing page:", error);
      }
    };

    fetchActivities();

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/announcements`);
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        const data = await response.json();
        setAnnouncements(data); // Get all announcements
      } catch (error) {
        console.error("Error fetching announcements for landing page:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  const features = [
    {
      icon: <Map size={48} strokeWidth={1.5} />,
      title: "Interactive GIS Mapping",
      description: "Real-time visualization of patrol routes and incident hotspots"
    },
    {
      icon: <Smartphone size={48} strokeWidth={1.5} />,
      title: "Mobile Reporting",
      description: "Report incidents instantly from anywhere in the barangay"
    },
    {
      icon: <BarChart size={48} strokeWidth={1.5} />,
      title: "Analytics Dashboard",
      description: "Data-driven insights for better community safety decisions"
    },
    {
      icon: <Users size={48} strokeWidth={1.5} />,
      title: "Community Network",
      description: "Connect residents, officials, and patrol teams seamlessly"
    }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Hero Section */}
      <main style={styles.hero}>
        <div style={styles.overlay}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>PatrolNet</h1>
            <h2 style={styles.heroSubtitle}>Empowering Safer Communities</h2>
            <p style={styles.heroDescription}>
              Real-time incident reporting, optimized patrol management, and seamless community connection.
            </p>
            <button style={styles.loginBtn} onClick={onLoginClick}>
              Log In to Dashboard
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <div style={styles.container}>
          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} style={styles.featureCard}>
                <div style={styles.featureIcon} className="feature-icon-wrapper">{feature.icon}</div>
                <h4 style={styles.featureTitle}>{feature.title}</h4>
                <p style={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIS Map Section */}
      <section style={styles.mapSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Explore Our Barangay</h3>
            <p style={styles.sectionSubtitle}>
              Interactive map showcasing important landmarks, patrol routes, and community resources
            </p>
          </div>

          <div style={styles.mapContainer}>
            <div style={styles.mapWrapper}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15424.79901589114!2d121.5835999688373!3d14.67323098985655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397e9a5a5a5a5a5%3A0x8c8c8c8c8c8c8c8c!2sTignoan%2C%20Real%2C%20Quezon!5e0!3m2!1sen!2sph!4v1680000000000"
                width="100%" 
                height="500" 
                style={styles.mapIframe}
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Barangay GIS Map">
              </iframe>
            </div>
            
            <div style={styles.mapStats}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>12</div>
                <div style={styles.statLabel}>Patrol Routes</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>24/7</div>
                <div style={styles.statLabel}>Monitoring</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>98%</div>
                <div style={styles.statLabel}>Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section style={styles.announcementsSection}>
        <div style={styles.container}>
          <Announcements showEmergencyContacts={false} showCommunityHub={false} />
        </div>
      </section>

      {/* History Section */}
      <section style={styles.historySection}>
        <div style={styles.historyOverlay}>
        <div style={styles.container}>
          <div style={{...styles.sectionHeader, color: 'white'}}>
            <h3 style={{...styles.sectionTitle, color: 'white'}}>Our Rich Heritage</h3>
            <p style={{...styles.sectionSubtitle, color: 'rgba(255, 255, 255, 0.9)'}}>
              Discover the story of Barangay Tignoan - from legend to legacy
            </p>
          </div>

          {/* Legend Story */}
          <div style={styles.legendContainer}>
            <div style={styles.legendHeader}>
              <span style={styles.legendBadge}>📜 Legend</span>
              <h4 style={styles.legendTitle}>The Legend of Tignoan</h4>
            </div>
            <div style={styles.legendContent}>
              <p style={styles.legendText}>
                In a far place in the Philippines, on a slope of Sierra Madre near the shoreline of Lamon Bay, 
                a married couple named <strong>Higno and Noan</strong> resided. They made <em>Tap-ong</em> (rock salt) 
                for a living by boiling salt water in clay pots over fire.
              </p>
              <p style={styles.legendText}>
                One day, while Higno was catching fish far out at sea, Noan finished cooking the Tap-ong but 
                couldn't remove the heavy clay pot from the fire alone. She called out desperately:
              </p>
              <div style={styles.legendQuote}>
                <span style={styles.quoteIcon}>❝</span>
                <p style={styles.quoteText}>Higno-o-o-o-o! Hignoo-o-o-o iga na! Higno-o-o-o-o iga na!</p>
              </div>
              <p style={styles.legendText}>
                A stranger passing through heard her cries and, unfamiliar with the place, began calling it 
                <strong> "Hignoan"</strong>. Through generations, the name evolved into what we know today as 
                <strong> Tignoan</strong>.
              </p>
            </div>
          </div>

          {/* Interactive Timeline Carousel */}
          <TimelineCarousel timelineData={timelineData} />

          {/* Key Milestones Cards */}
          <div style={styles.milestonesSection}>
            <h4 style={styles.milestonesTitle}>Key Milestones</h4>
            <div style={styles.milestonesGrid}>
              {milestones.map((milestone, index) => (
                <div key={index} style={styles.milestoneCard}>
                  <div style={styles.milestoneIcon} className="milestone-icon">{milestone.icon}</div>
                  <h5 style={styles.milestoneTitle}>{milestone.title}</h5>
                  <p style={styles.milestoneText}>{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Activities Section */}
      <section style={styles.activitiesSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Community Activities</h3>
            <p style={styles.sectionSubtitle}>
              Recent events and initiatives that make our barangay thrive
            </p>
          </div>

          <ActivitiesCarousel activities={activities} />
        </div>
      </section>

      {/* Call to Action */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <div style={styles.ctaContent}>
            <h3 style={styles.ctaTitle}>Ready to Make a Difference?</h3>
            <p style={styles.ctaDesc}>
              Join our community platform and help build a safer neighborhood for everyone
            </p>
            <button style={styles.ctaButton} onClick={onLoginClick}>
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Community Announcements Section */}
      <section style={styles.communityAnnouncementsSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Community Announcements</h3>
            <p style={styles.sectionSubtitle}>
              Stay informed about the latest news and updates in our barangay.
            </p>
          </div>
          <AnnouncementsCarousel announcements={announcements} />
        </div>
      </section>

      {/* Contact Section */}
      <section style={styles.contactSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Get in Touch</h3>
            <p style={styles.sectionSubtitle}>
              Have questions or need to report something? We're here to help.
            </p>
          </div>
          <div style={styles.contactWrapper}>
            <div style={styles.contactDetails}>
              <h4 style={styles.contactTitle}>Contact Information</h4>
              <p style={styles.contactText}><strong>Address:</strong> Purok 1, Tignoan, Real, Quezon</p>
              <p style={styles.contactText}><strong>Hotline:</strong> (123) 456-7890</p>
              <p style={styles.contactText}><strong>Email:</strong> contact@tignoan.gov.ph</p>
              <h4 style={styles.contactTitle}>Office Hours</h4>
              <p style={styles.contactText}>Monday - Friday: 8:00 AM - 5:00 PM</p>
              <p style={styles.contactText}>Closed on weekends and public holidays.</p>
            </div>
            <div style={styles.contactForm}>
              <h4 style={styles.contactTitle}>Send us a Message</h4>
              <form>
                <input type="text" name="name" placeholder="Your Name" required style={styles.formInput} />
                <input type="email" name="email" placeholder="Your Email" required style={styles.formInput} />
                <textarea name="message" rows="5" placeholder="Your Message" required style={styles.formTextarea}></textarea>
                <button type="submit" style={styles.formSubmitButton}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Announcements Carousel Component
function AnnouncementsCarousel({ announcements }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;

  const nextSlide = () => {
    if (currentIndex < announcements.length - cardsPerView) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const visibleAnnouncements = announcements.slice(currentIndex, currentIndex + cardsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < announcements.length - cardsPerView;

  if (announcements.length === 0) {
    return (
      <div style={styles.activitiesEmpty}>
        <p>No announcements to display yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div style={styles.activitiesCarouselContainer}>
      <div style={styles.activitiesCarouselWrapper}>
        {/* Previous Button */}
        <button 
          onClick={prevSlide} 
          style={{
            ...styles.activityCarouselButton,
            ...(canGoPrev ? {} : styles.activityCarouselButtonDisabled)
          }}
          disabled={!canGoPrev}
          aria-label="Previous announcements"
        >
          <span style={styles.carouselArrow}>‹</span>
        </button>

        {/* Announcements Cards Container */}
        <div style={styles.activitiesCardsContainer}>
          <div style={styles.activitiesCardsWrapper}>
            {visibleAnnouncements.map((announcement) => (
              <div key={announcement._id} style={styles.announcementCard}>
                {announcement.image && (
                  <img src={`${BASE_URL}/uploads/${announcement.image}`} alt={announcement.title} style={styles.announcementImage} />
                )}
                <div style={styles.announcementContent}>
                  <h4 style={styles.announcementTitle}>{announcement.title}</h4>
                  <p style={styles.announcementDate}>{new Date(announcement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style={styles.announcementDescription}>{announcement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={nextSlide} 
          style={{
            ...styles.activityCarouselButton,
            ...(canGoNext ? {} : styles.activityCarouselButtonDisabled)
          }}
          disabled={!canGoNext}
          aria-label="Next announcements"
        >
          <span style={styles.carouselArrow}>›</span>
        </button>
      </div>

      {/* Progress Indicators */}
      {announcements.length > cardsPerView && (
        <div style={styles.activityCarouselIndicators}>
          {Array.from({ length: announcements.length - cardsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                ...styles.indicator,
                ...(index === currentIndex ? styles.indicatorActive : {})
              }}
              aria-label={`Go to announcement group ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Timeline Carousel Component
function TimelineCarousel({ timelineData }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % timelineData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + timelineData.length) % timelineData.length);
  };

  const currentItem = timelineData[currentIndex];

  return (
    <div style={styles.timelineContainer}>
      <h4 style={styles.timelineTitle}>Historical Timeline</h4>
      
      <div style={styles.carouselWrapper}>
        {/* Previous Button */}
        <button 
          onClick={prevSlide} 
          style={styles.carouselButton}
          aria-label="Previous timeline event"
        >
          <span style={styles.carouselArrow}>‹</span>
        </button>

        {/* Timeline Card */}
        <div style={styles.carouselCard}>
          <div style={styles.carouselMarker}>{currentItem.year}</div>
          <div style={styles.carouselContent}>
            <h5 style={styles.carouselTitle}>{currentItem.title}</h5>
            <p style={styles.carouselText}>{currentItem.description}</p>
          </div>
          
          {/* Progress Indicators */}
          <div style={styles.carouselIndicators}>
            {timelineData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  ...styles.indicator,
                  ...(index === currentIndex ? styles.indicatorActive : {})
                }}
                aria-label={`Go to timeline ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={nextSlide} 
          style={styles.carouselButton}
          aria-label="Next timeline event"
        >
          <span style={styles.carouselArrow}>›</span>
        </button>
      </div>

      {/* Counter */}
      <div style={styles.carouselCounter}>
        {currentIndex + 1} / {timelineData.length}
      </div>
    </div>
  );
}

// Activities Carousel Component
function ActivitiesCarousel({ activities }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;

  const nextSlide = () => {
    if (currentIndex < activities.length - cardsPerView) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const visibleActivities = activities.slice(currentIndex, currentIndex + cardsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < activities.length - cardsPerView;

  if (activities.length === 0) {
    return (
      <div style={styles.activitiesEmpty}>
        <p>No activities to display yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div style={styles.activitiesCarouselContainer}>
      <div style={styles.activitiesCarouselWrapper}>
        {/* Previous Button */}
        <button 
          onClick={prevSlide} 
          style={{
            ...styles.activityCarouselButton,
            ...(canGoPrev ? {} : styles.activityCarouselButtonDisabled)
          }}
          disabled={!canGoPrev}
          aria-label="Previous activities"
        >
          <span style={styles.carouselArrow}>‹</span>
        </button>

        {/* Activities Cards Container */}
        <div style={styles.activitiesCardsContainer}>
          <div style={styles.activitiesCardsWrapper}>
            {visibleActivities.map((activity) => (
              <div key={activity.id} style={styles.activityCard}>
                <div style={styles.activityImageWrapper}>
                  <img
                    src={activity.image ? `${BASE_URL}/uploads/${activity.image}` : 'https://via.placeholder.com/400x220/e2e8f0/64748b?text=No+Image'}
                    alt={activity.title}
                    style={styles.activityImage}
                  />                  
                  <div style={styles.activityIcon}>{activity.icon || '📅'}</div>
                </div>
                <div style={styles.activityContent}>
                  <h4 style={styles.activityTitle}>{activity.title}</h4>
                  <p style={styles.activityDesc}>{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={nextSlide} 
          style={{
            ...styles.activityCarouselButton,
            ...(canGoNext ? {} : styles.activityCarouselButtonDisabled)
          }}
          disabled={!canGoNext}
          aria-label="Next activities"
        >
          <span style={styles.carouselArrow}>›</span>
        </button>
      </div>

      {/* Progress Indicators */}
      {activities.length > cardsPerView && (
        <div style={styles.activityCarouselIndicators}>
          {Array.from({ length: activities.length - cardsPerView + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                ...styles.indicator,
                ...(index === currentIndex ? styles.indicatorActive : {})
              }}
              aria-label={`Go to activity group ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {activities.length > cardsPerView && (
        <div style={styles.carouselCounter}>
          Showing {currentIndex + 1}-{Math.min(currentIndex + cardsPerView, activities.length)} of {activities.length}
        </div>
      )}
    </div>
  );
}

// Timeline Data
const timelineData = [
  {
    year: "1930s",
    title: "Early Settlement",
    description: "Dumagat (Aeta) were the first inhabitants. The area was known as Binangonan de Lampon. Famy-Infanta Road was inaugurated."
  },
  {
    year: "1940s",
    title: "World War II Era",
    description: "First bridge built but later bombed by Japanese Army during WWII."
  },
  {
    year: "1950s",
    title: "Post-War Development",
    description: "Second bridge constructed. Eastern Tayabas Bus Co. established service. Area used as hideout by HUKBALAHAP and Battalion Combat Team."
  },
  {
    year: "1962",
    title: "Barangay Independence",
    description: "After land measurement in 1961, Tignoan officially declared as a barangay of Real, separate from Barangay Capalong. First Punong Barangay: Andres Evardome."
  },
  {
    year: "1966",
    title: "Education Begins",
    description: "Tignoan Elementary School established (Grades 1-4 initially)."
  },
  {
    year: "1976",
    title: "First Fiesta",
    description: "August 15 - Inaugural fiesta celebration honoring the Assumption of Mary, the barangay's patron."
  },
  {
    year: "1989",
    title: "Electrification",
    description: "QUEZELCO brings electricity to Barangay Tignoan."
  },
  {
    year: "1996",
    title: "Tourism Era Begins",
    description: "Beach resorts start developing, marking the beginning of tourism. MSK (Munting Sambayanang Kristiyano) formed."
  },
  {
    year: "Present",
    title: "Modern Tignoan",
    description: "A thriving community with growing tourism, education facilities, and strong community spirit under the leadership of Punong Barangay Ariel E. Montes."
  }
];

// Milestones Data
const milestones = [
  {
    icon: <Users size={48} strokeWidth={1.5} />,
    title: "First Inhabitants",
    description: "Evardome and Atendido families among the 20 founding families"
  },
  {
    icon: <School size={48} strokeWidth={1.5} />,
    title: "Education Growth",
    description: "From Grade 1-4 (1966) to complete elementary education"
  },
  {
    icon: <Zap size={48} strokeWidth={1.5} />,
    title: "Electrification",
    description: "QUEZELCO brought power to homes in 1989"
  },
  {
    icon: <Waves size={48} strokeWidth={1.5} />,
    title: "Tourism Boom",
    description: "Beach resorts development started in 1996"
  },
  {
    icon: <Church size={48} strokeWidth={1.5} />,
    title: "Patron Saint",
    description: "Assumption of Mary celebrated every August 15"
  },
  {
    icon: <Store size={48} strokeWidth={1.5} />,
    title: "Local Commerce",
    description: "Talipapa sea-side market opened in 1997"
  }
];

const styles = {
  pageWrapper: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#1f2937',
    lineHeight: 1.6,
  },
  
  hero: {
    position: 'relative',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `linear-gradient(135deg, rgba(218, 38, 38, 0.69), rgba(239, 68, 68, 0.6)), url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  
  overlay: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  heroContent: {
    textAlign: 'center',
    color: 'white',
    padding: '20px',
    maxWidth: '800px',
  },
  
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '900',
    margin: '0 0 10px 0',
    letterSpacing: '-2px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  
  heroSubtitle: {
    fontSize: '2rem',
    fontWeight: '600',
    margin: '0 0 20px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  
  heroDescription: {
    fontSize: '1.2rem',
    margin: '0 0 40px 0',
    opacity: 0.95,
    lineHeight: 1.8,
  },
  
  loginBtn: {
    padding: '18px 48px',
    backgroundColor: 'white',
    color: '#da2626',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  
  featuresSection: {
    padding: '80px 20px',
    backgroundColor: '#ffffff',
  },
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  
  featureCard: {
    textAlign: 'center',
    padding: '40px 20px',
    transition: 'transform 0.3s ease',
  },
  
  featureIcon: {
    fontSize: '3.5rem',
    marginBottom: '20px',
    color: '#da2626',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
  },
  
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    color: '#111827',
  },
  
  featureDesc: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },
  
  mapSection: {
    padding: '100px 20px',
    backgroundColor: '#f9fafb',
  },
  
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 15px 0',
    color: '#111827',
  },
  
  sectionSubtitle: {
    fontSize: '1.2rem',
    color: '#6b7280',
    margin: 0,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  },
  
  mapWrapper: {
    position: 'relative',
    width: '100%',
    height: '500px',
  },
  
  mapIframe: {
    border: 0,
    display: 'block',
  },
  
  mapStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px',
    backgroundColor: '#e5e7eb',
  },
  
  statItem: {
    backgroundColor: 'white',
    padding: '30px 20px',
    textAlign: 'center',
  },
  
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#da2626',
    marginBottom: '8px',
  },
  
  statLabel: {
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  
  announcementsSection: {
    padding: '100px 20px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
  },

  // History Section Styles
  historySection: {
    
    position: 'relative',
    backgroundImage: `url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  historyOverlay: {
    backgroundColor: 'rgba(218, 38, 38, 0.62)',
    padding: '100px 0',
    margin: '-100px 0'
  },
  
  legendContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '60px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    border: '3px solid #f59e0b',
  },
  
  legendHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  
  legendBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '50px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
  },
  
  legendTitle: {
    fontSize: '2rem',
    color: '#92400e',
    margin: 0,
    fontWeight: '800',
  },
  
  legendContent: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  
  legendText: {
    fontSize: '1.05rem',
    lineHeight: 1.8,
    color: '#44403c',
    marginBottom: '20px',
  },
  
  legendQuote: {
    background: '#fef3c7',
    borderLeft: '5px solid #f59e0b',
    padding: '30px 40px',
    margin: '30px 0',
    borderRadius: '10px',
    position: 'relative',
  },
  
  quoteIcon: {
    fontSize: '3rem',
    color: '#f59e0b',
    opacity: 0.3,
    position: 'absolute',
    top: '10px',
    left: '15px',
  },
  
  quoteText: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#92400e',
    fontStyle: 'italic',
    margin: 0,
    paddingLeft: '40px',
  },
  
  timelineContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px 40px',
    marginBottom: '60px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  
  timelineTitle: {
    fontSize: '2rem',
    color: '#111827',
    textAlign: 'center',
    margin: '0 0 50px 0',
    fontWeight: '800',
  },
  
  // Carousel Styles
  carouselWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  
  carouselButton: {
    background: 'linear-gradient(135deg, #da2626 0%, #f59e0b 100%)',
    border: 'none',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(218, 38, 38, 0.3)',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
  
  carouselArrow: {
    color: 'white',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  
  carouselCard: {
    flex: 1,
    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    border: '3px solid #da2626',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  
  carouselMarker: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #da2626 0%, #f59e0b 100%)',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '50px',
    fontWeight: '800',
    fontSize: '1.3rem',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(218, 38, 38, 0.3)',
    marginBottom: '25px',
    alignSelf: 'center',
  },
  
  carouselContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  
  carouselTitle: {
    fontSize: '1.8rem',
    color: '#da2626',
    margin: '0 0 15px 0',
    fontWeight: '700',
    textAlign: 'center',
  },
  
  carouselText: {
    fontSize: '1.1rem',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.8,
    textAlign: 'center',
  },
  
  carouselIndicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  
  indicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid #da2626',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  },
  
  indicatorActive: {
    background: '#da2626',
    transform: 'scale(1.3)',
  },
  
  carouselCounter: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '600',
  },
  
  timeline: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  
  timelineItem: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
  },
  
  timelineMarker: {
    flex: '0 0 120px',
    background: 'linear-gradient(135deg, #da2626 0%, #f59e0b 100%)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '50px',
    fontWeight: '800',
    fontSize: '1.1rem',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(218, 38, 38, 0.3)',
  },
  
  timelineContent: {
    flex: 1,
    background: '#f9fafb',
    padding: '25px 30px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
  },
  
  timelineContentTitle: {
    fontSize: '1.3rem',
    color: '#da2626',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  
  timelineContentText: {
    fontSize: '1rem',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.7,
  },
  
  milestonesSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px 40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  
  milestonesTitle: {
    fontSize: '2rem',
    color: '#111827',
    textAlign: 'center',
    margin: '0 0 40px 0',
    fontWeight: '800',
  },
  
  milestonesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  
  milestoneCard: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    padding: '30px 25px',
    borderRadius: '16px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    border: '2px solid #fbbf24',
  },
  
  milestoneIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    color: '#92400e',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease',
  },
  
  milestoneTitle: {
    fontSize: '1.2rem',
    color: '#92400e',
    margin: '0 0 10px 0',
    fontWeight: '700',
  },
  
  milestoneText: {
    fontSize: '0.95rem',
    color: '#78716c',
    margin: 0,
    lineHeight: 1.6,
  },
  
  activitiesSection: {
    padding: '100px 20px',
    backgroundColor: '#ffffff',
  },
  
  activitiesEmpty: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '1.2rem',
    color: '#6b7280',
  },
  
  activitiesCarouselContainer: {
    position: 'relative',
  },
  
  activitiesCarouselWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    justifyContent: 'center',
  },
  
  activityCarouselButton: {
    background: 'linear-gradient(135deg, #da2626 0%, #f59e0b 100%)',
    border: 'none',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(218, 38, 38, 0.3)',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
  
  activityCarouselButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  
  activitiesCardsContainer: {
    flex: 1,
    overflow: 'hidden',
    maxWidth: '1100px',
  },
  
  activitiesCardsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '25px',
    transition: 'transform 0.4s ease',
  },
  
  activityCarouselIndicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  
  activitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '35px',
  },
  
  activityCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '500px',
  },
  
  activityImageWrapper: {
    position: 'relative',
    width: '100%',
    height: '220px',
    overflow: 'hidden',
  },
  
  activityImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  
  activityIcon: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: 'white',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
  },
  
  activityContent: {
    padding: '25px',
  },
  
  activityTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    color: '#111827',
  },
  
  activityDesc: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.7,
  },
  
  ctaSection: {
    padding: '100px 20px',
    background: 'linear-gradient(135deg, #da2626 0%, #ef4444 100%)',
  },
  
  ctaContent: {
    textAlign: 'center',
    color: 'white',
  },
  
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 20px 0',
  },
  
  ctaDesc: {
    fontSize: '1.2rem',
    margin: '0 0 40px 0',
    opacity: 0.95,
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  
  ctaButton: {
    padding: '18px 48px',
    backgroundColor: 'white',
    color: '#da2626',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  // Community Announcements Section
  communityAnnouncementsSection: {
    padding: '100px 20px',
    backgroundColor: '#f9fafb',
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '500px', // Set a fixed height for the card
    flex: '1 0 calc(33.333% - 20px)', // For carousel
  },
  announcementImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  announcementContent: {
    padding: '25px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  announcementTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  announcementDate: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '16px',
  },
  announcementDescription: {
    fontSize: '1rem',
    color: '#4b5563',
    lineHeight: 1.6,
    margin: 0,
    flexGrow: 1, // Keep this to push date to bottom if content is short
    overflow: 'hidden', // Hide overflowing text
    textOverflow: 'ellipsis', // Add ellipsis for overflowing text
    display: '-webkit-box',
    WebkitLineClamp: 4, // Limit to 4 lines
    WebkitBoxOrient: 'vertical',
  },
  noAnnouncementsText: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#6b7280',
    padding: '40px 0',
    backgroundColor: '#fff',
    borderRadius: '16px',
  },
};

// Contact Section Styles
styles.contactSection = {
  padding: '100px 20px',
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e5e7eb',
};
styles.contactWrapper = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.5fr',
  gap: '60px',
  alignItems: 'flex-start',
  background: '#f9fafb',
  padding: '50px',
  borderRadius: '20px',
};
styles.contactDetails = {
  
};
styles.contactTitle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#da2626',
  marginBottom: '20px',
  borderBottom: '2px solid #fde68a',
  paddingBottom: '10px',
};
styles.contactText = {
  fontSize: '1rem',
  color: '#4b5563',
  margin: '0 0 15px 0',
  lineHeight: 1.7,
};
styles.contactForm = {

};
styles.formInput = {
  width: '100%',
  padding: '15px',
  marginBottom: '20px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  boxSizing: 'border-box',
};
styles.formTextarea = {
  width: '100%',
  padding: '15px',
  marginBottom: '20px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  resize: 'vertical',
  boxSizing: 'border-box',
};
styles.formSubmitButton = {
  ...styles.ctaButton,
  width: '100%',
  padding: '15px 30px',
};

// Add hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
    }
    button[aria-label*="timeline"]:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(218, 38, 38, 0.4) !important;
    }
    button[aria-label*="activities"]:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(218, 38, 38, 0.4) !important;
    }
    button[aria-label*="Go to timeline"]:hover,
    button[aria-label*="Go to activity"]:hover {
      transform: scale(1.5);
    }
    .feature-icon-wrapper:hover {
      transform: scale(1.1) rotate(-5deg);
    }
    div[style*="milestoneCard"]:hover .milestone-icon {
      transform: scale(1.15) rotate(5deg);
    }
    @media (min-width: 769px) {
      div[style*="cursor: pointer"]:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
      }
      div[style*="cursor: pointer"]:hover img {
        transform: scale(1.05);
      }
    }
    @media (max-width: 1024px) {
      div[style*="activitiesCardsWrapper"] {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
    @media (max-width: 768px) {
      div[style*="carouselWrapper"],
      div[style*="activitiesCarouselWrapper"] {
        flex-direction: column;
        gap: 15px !important;
      }
      button[aria-label*="timeline"],
      button[aria-label*="activities"] {
        width: 50px !important;
        height: 50px !important;
      }
      div[style*="carouselCard"] {
        padding: 30px 20px !important;
        min-height: 250px !important;
      }
      div[style*="carouselMarker"] {
        font-size: 1.1rem !important;
        padding: 10px 20px !important;
      }
      div[style*="carouselTitle"] {
        font-size: 1.4rem !important;
      }
      div[style*="carouselText"] {
        font-size: 1rem !important;
      }
      div[style*="activitiesCardsWrapper"] {
        grid-template-columns: 1fr !important;
      }
      div[style*="contactWrapper"] {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 480px) {
      button[aria-label*="timeline"],
      button[aria-label*="activities"] {
        width: 45px !important;
        height: 45px !important;
      }
      span[style*="carouselArrow"] {
        font-size: 2rem !important;
      }
      div[style*="carouselCard"] {
        padding: 25px 15px !important;
        min-height: 220px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Landingpage;