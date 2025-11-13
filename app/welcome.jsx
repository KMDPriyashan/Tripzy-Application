import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const Welcome = () => {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Image at the top with 20 padding */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/welcome-back.jpg')}
          style={styles.topImage}
          resizeMode="cover"
        />
      </View>

      

      {/* Main Heading */}
      <View style={styles.mainHeadingSection}>
        <Text style={styles.mainHeading}>Manage Your Traveling Journey</Text>
      </View>

      {/* Paragraph Section */}
      <View style={styles.paragraphSection}>
        <Text style={styles.paragraphText}>
          Discover your next adventure with ease—use our app to unlock exciting 
          new travel deals and journey smarter!
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/loginpage')}>
          <Text style={styles.primaryButtonText}>Application Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/signup')}>
          <Text style={styles.secondaryButtonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    paddingTop: 50, // 20 padding from top
    width: '100%',
    height: 400, // Adjust height as needed
    marginBottom: 20,
  },
  topImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10, // Optional: for rounded corners
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeadingText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  mainHeadingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32,
  },
  paragraphSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  paragraphText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsSection: {
    alignItems: 'center',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 300,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});