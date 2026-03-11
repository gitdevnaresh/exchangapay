import AsyncStorage from '@react-native-async-storage/async-storage';

const PATTERN_STORAGE_KEY = 'APP_PATTERN_LOCK';

export const PatternLockHelper = {
  /**
   * Save pattern to local storage
   */
  async savePattern(pattern: number[]): Promise<boolean> {
    try {
      const patternString = pattern.join('-');
      await AsyncStorage.setItem(PATTERN_STORAGE_KEY, patternString);
      return true;
    } catch (error) {
      console.error('Error saving pattern:', error);
      return false;
    }
  },

  /**
   * Get saved pattern from local storage
   */
  async getPattern(): Promise<number[] | null> {
    try {
      const patternString = await AsyncStorage.getItem(PATTERN_STORAGE_KEY);
      if (patternString) {
        return patternString.split('-').map(Number);
      }
      return null;
    } catch (error) {
      console.error('Error getting pattern:', error);
      return null;
    }
  },

  /**
   * Verify pattern against saved pattern
   */
  async verifyPattern(inputPattern: number[]): Promise<boolean> {
    try {
      const savedPattern = await this.getPattern();
      if (!savedPattern) {
        return false;
      }
      
      return JSON.stringify(savedPattern) === JSON.stringify(inputPattern);
    } catch (error) {
      console.error('Error verifying pattern:', error);
      return false;
    }
  },

  /**
   * Clear saved pattern
   */
  async clearPattern(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(PATTERN_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing pattern:', error);
      return false;
    }
  },

  /**
   * Check if pattern is set
   */
  async isPatternSet(): Promise<boolean> {
    try {
      const pattern = await this.getPattern();
      return pattern !== null && pattern.length > 0;
    } catch (error) {
      console.error('Error checking if pattern is set:', error);
      return false;
    }
  }
};

export default PatternLockHelper;
