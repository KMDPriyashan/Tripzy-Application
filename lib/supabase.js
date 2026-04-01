// src/services/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tipnlvbklvgjtvxmzfor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcG5sdmJrbHZnanR2eG16Zm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzMyNjksImV4cCI6MjA3ODI0OTI2OX0.CNQeo4zQa23ZLXRVtjO5AD-1oUl9dtcDCy-zUpPdiQw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Improved search function with better error handling
export const searchDatabaseLocations = async (searchQuery) => {
  console.log('🔍 Searching for:', searchQuery);
  
  if (!searchQuery || searchQuery.length < 2) {
    console.log('Query too short');
    return [];
  }
  
  try {
    // Try direct query first (more reliable)
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`)
      .order('search_count', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Database query error:', error);
      return [];
    }
    
    console.log('✅ Found', data?.length || 0, 'locations in database');
    
    // Add relevance score and format results
    const formattedResults = (data || []).map(loc => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      source: 'database',
      rating: loc.rating,
      category: loc.category,
      city: loc.city,
      district: loc.district,
      search_relevance: calculateRelevance(loc, searchQuery)
    }));
    
    // Sort by relevance
    formattedResults.sort((a, b) => b.search_relevance - a.search_relevance);
    
    return formattedResults;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Calculate relevance score
const calculateRelevance = (location, query) => {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerName = (location.name || '').toLowerCase();
  const lowerCity = (location.city || '').toLowerCase();
  const lowerDistrict = (location.district || '').toLowerCase();
  
  if (lowerName === lowerQuery) score += 100;
  else if (lowerName.includes(lowerQuery)) score += 50;
  
  if (lowerCity === lowerQuery) score += 80;
  else if (lowerCity.includes(lowerQuery)) score += 40;
  
  if (lowerDistrict === lowerQuery) score += 70;
  else if (lowerDistrict.includes(lowerQuery)) score += 35;
  
  // Boost popular locations
  if (location.popular) score += 20;
  
  // Boost based on rating
  if (location.rating) score += location.rating * 2;
  
  return score;
};

// Get popular locations
export const getPopularLocations = async (limit = 8) => {
  console.log('📌 Fetching popular locations...');
  
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('popular', true)
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching popular locations:', error);
      // Fallback: get any locations
      const { data: fallbackData } = await supabase
        .from('locations')
        .select('*')
        .limit(limit);
      return fallbackData || [];
    }
    
    console.log('✅ Popular locations found:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Get all locations
export const getAllLocations = async () => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

// Get nearby locations
export const getNearbyLocations = async (latitude, longitude, radius = 5) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*');
    
    if (error) throw error;
    
    // Calculate distance and filter
    const nearby = (data || []).filter(loc => {
      const distance = calculateDistance(
        latitude, longitude,
        parseFloat(loc.latitude), 
        parseFloat(loc.longitude)
      );
      return distance <= radius;
    }).sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, parseFloat(a.latitude), parseFloat(a.longitude));
      const distB = calculateDistance(latitude, longitude, parseFloat(b.latitude), parseFloat(b.longitude));
      return distA - distB;
    });
    
    return nearby;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get location by category
export const getLocationsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('category', category)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Add new location
export const addLocation = async (locationData) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding location:', error);
    return null;
  }
};

// Delete location
export const deleteLocation = async (id) => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting location:', error);
    return false;
  }
};