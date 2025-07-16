/**
 * RECOMMENDED: Simplified but secure password handling
 * Client sends plain password over HTTPS, server handles all encryption
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Server-side password handling (RECOMMENDED APPROACH)
class PasswordSecurity {
  
  /**
   * Hash password for storage (signup)
   */
  static async hashPassword(plainPassword) {
    const saltRounds = 12; // bcrypt auto-generates salt
    return await bcrypt.hash(plainPassword, saltRounds);
  }
  
  /**
   * Verify password (login)
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * If you want to keep client-side encryption, decode it here
   */
  static decodeClientEncryptedPassword(encryptedPassword) {
    try {
      // Decode the base64 from client
      const decoded = JSON.parse(Buffer.from(encryptedPassword, 'base64').toString());
      return decoded; // { salt: "...", hash: "..." }
    } catch (error) {
      throw new Error('Invalid encrypted password format');
    }
  }
  
  /**
   * Verify client-encrypted password against stored hash
   */
  static verifyClientEncryptedPassword(encryptedPassword, storedEncryptedPassword) {
    try {
      const clientDecoded = this.decodeClientEncryptedPassword(encryptedPassword);
      const storedDecoded = this.decodeClientEncryptedPassword(storedEncryptedPassword);
      
      // Compare the hashes (both should be derived from same password with their respective salts)
      // Note: This is complex because we can't reverse the hash to get original password
      
      return encryptedPassword === storedEncryptedPassword; // Simple comparison
    } catch (error) {
      return false;
    }
  }
}

module.exports = PasswordSecurity;
