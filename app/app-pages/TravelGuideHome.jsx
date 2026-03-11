import { Award, Camera, ChevronRight, Heart, MapPin, MessageCircle, Star } from 'lucide-react';
import styled, { createGlobalStyle } from 'styled-components';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #f5f7fa;
  }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Header = styled.header`
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const MainTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

const ViewAllBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #007AFF;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 122, 255, 0.1);
  }
`;

const RecommendedSection = styled.section`
  margin-bottom: 40px;
`;

const RecommendedScroll = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 5px;
  scrollbar-width: thin;
  scrollbar-color: #007AFF #f0f0f0;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #007AFF;
    border-radius: 10px;
  }
`;

const RecommendedCard = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const RecommendedAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #007AFF;
  padding: 3px;
  background: white;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const RecommendedName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  text-align: center;
`;

const GuidesSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const GuideCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 122, 255, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 122, 255, 0.15);
    border-color: #007AFF;
  }
`;

const GuideCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const GuideProfile = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const GuideAvatar = styled.div`
  position: relative;
  width: 80px;
  height: 80px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #007AFF;
  }
`;

const TopGusterBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #007AFF;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
`;

const GuideInfo = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 5px;
    color: #333;
  }
`;

const GuideRole = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 3px;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const GuideExperience = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 3px;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const Icon = styled.span`
  color: #007AFF;
  display: flex;
  align-items: center;
`;

const TopGusterTag = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #007AFF;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;

  @media (max-width: 768px) {
    align-self: flex-start;
  }
`;

const GuideStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding: 5px 20px;
  }
`;

const StatIcon = styled.div`
  margin-bottom: 5px;
  
  &.star {
    color: #FFD700;
  }
  
  &.heart {
    color: #FF3B30;
  }
  
  &.comment {
    color: #007AFF;
  }
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

const WhatsAppBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #25D366;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #128C7E;
    transform: scale(1.02);
  }
`;

const WhatsAppIcon = styled.img`
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
`;

const TravelGuideHome = () => {
  const recommendedGuides = [
    { id: 1, name: 'S.Nirmi', image: 'https://via.placeholder.com/80' },
    { id: 2, name: 'Navodya', image: 'https://via.placeholder.com/80' },
    { id: 3, name: 'Skay_Duvi', image: 'https://via.placeholder.com/80' },
    { id: 4, name: 'Konara Travels', image: 'https://via.placeholder.com/80' },
    { id: 5, name: 'TK_Couple', image: 'https://via.placeholder.com/80' }
  ];

  const guides = [
    {
      id: 1,
      name: 'Mr. Kasun Liyanage',
      role: 'Official Photographer and Travel Guider',
      experience: '8 years Experience',
      rating: '4.7',
      ratings: '1.2k',
      comments: '1.75k',
      isTopGuster: true,
      image: 'https://via.placeholder.com/120',
      badge: 'Top Guster'
    },
    {
      id: 2,
      name: 'Mr. Pawan Perera',
      role: 'Official Photographer and Travel Guider',
      experience: '2 year Experience',
      rating: '4.5',
      ratings: '1.2k',
      comments: '1.75k',
      isTopGuster: false,
      image: 'https://via.placeholder.com/120'
    },
    {
      id: 3,
      name: 'Mr. Kalana madushan',
      role: 'Official Photographer and Travel Guider',
      experience: '2 year Experience',
      rating: '4.5',
      ratings: '1.2k',
      comments: '1.75k',
      isTopGuster: false,
      image: 'https://via.placeholder.com/120'
    }
  ];

  const handleWhatsAppConnect = (guideName) => {
    console.log(`Connecting to ${guideName} on WhatsApp`);
    // window.location.href = `https://wa.me/your-phone-number`;
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <div className="header-content">
            <MainTitle>Your Guided Journey Awaits</MainTitle>
            <Subtitle>Expert-led tours, unforgettable experiences.</Subtitle>
          </div>
        </Header>

        <RecommendedSection>
          <SectionHeader>
            <SectionTitle>Highly Recommended Travel Guiders</SectionTitle>
            <ViewAllBtn>
              View All <ChevronRight size={18} />
            </ViewAllBtn>
          </SectionHeader>
          
          <RecommendedScroll>
            {recommendedGuides.map((guide) => (
              <RecommendedCard key={guide.id}>
                <RecommendedAvatar>
                  <img src={guide.image} alt={guide.name} />
                </RecommendedAvatar>
                <RecommendedName>{guide.name}</RecommendedName>
              </RecommendedCard>
            ))}
          </RecommendedScroll>
        </RecommendedSection>

        <GuidesSection>
          {guides.map((guide) => (
            <GuideCard key={guide.id}>
              <GuideCardHeader>
                <GuideProfile>
                  <GuideAvatar>
                    <img src={guide.image} alt={guide.name} />
                    {guide.isTopGuster && (
                      <TopGusterBadge>
                        <Award size={16} />
                      </TopGusterBadge>
                    )}
                  </GuideAvatar>
                  <GuideInfo>
                    <h3>{guide.name}</h3>
                    <GuideRole>
                      <Icon><Camera size={14} /></Icon>
                      {guide.role}
                    </GuideRole>
                    <GuideExperience>
                      <Icon><MapPin size={14} /></Icon>
                      {guide.experience}
                    </GuideExperience>
                  </GuideInfo>
                </GuideProfile>
                
                {guide.isTopGuster && (
                  <TopGusterTag>
                    <Award size={14} />
                    <span>Top Guster</span>
                  </TopGusterTag>
                )}
              </GuideCardHeader>

              <GuideStats>
                <StatItem>
                  <StatIcon className="star">
                    <Star size={16} />
                  </StatIcon>
                  <StatValue>{guide.rating}</StatValue>
                  <StatLabel>Ratings</StatLabel>
                </StatItem>
                <StatItem>
                  <StatIcon className="heart">
                    <Heart size={16} />
                  </StatIcon>
                  <StatValue>{guide.ratings}</StatValue>
                  <StatLabel>React</StatLabel>
                </StatItem>
                <StatItem>
                  <StatIcon className="comment">
                    <MessageCircle size={16} />
                  </StatIcon>
                  <StatValue>{guide.comments}</StatValue>
                  <StatLabel>Comment</StatLabel>
                </StatItem>
              </GuideStats>

              <WhatsAppBtn onClick={() => handleWhatsAppConnect(guide.name)}>
                <WhatsAppIcon 
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                  alt="WhatsApp" 
                />
                Connect to the WhatsApp
              </WhatsAppBtn>
            </GuideCard>
          ))}
        </GuidesSection>
      </Container>
    </>
  );
};

export default TravelGuideHome;