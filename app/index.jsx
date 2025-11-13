import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Index = () => {
    const router = useRouter(); // Correct hook and function call

    return (
        <ImageBackground 
            source={require('../assets/images/index_back.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {/* Top Section with Welcome Text */}
                <View style={styles.topSection}>
                    <Text style={styles.greetingText}>Hi ! Traveler</Text>
                    <Text style={styles.welcomeText}>Welcome !</Text>
                    <Text style={styles.subtitleText}>It's Big Word Out. There Go Explore</Text>
                </View>

                {/* Middle Section with Description */}
                <View style={styles.middleSection}>
                    <Text style={styles.descriptionText}>
                        Let's explore amazing places{"\n"}
                        and make unforgettable memories together.
                    </Text>
                </View>

                {/* Bottom Section with Button */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={() => router.push('/welcome')} // Use router.push with correct path
                    >
                        <Text style={styles.buttonText}>Let's Go</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 50,
    },
    topSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000000ff',
        marginBottom: 5,
        textAlign: 'center',
        marginLeft: 35,
    },
    welcomeText: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#000000ff',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 30,
        fontWeight: '500',
        color: '#000000ff',
        marginBottom: 5,
        textAlign: 'center',
        fontFamily: 'serif',
        marginTop: 20,
    },
    middleSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    descriptionText: {
        fontSize: 14,
        color: '#000000ff',
        textAlign: 'center',
        lineHeight: 23,
        marginBottom: 270,
    },
    bottomSection: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#000000',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textAlign: 'center',
    },
});

export default Index;