const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate access token (expires in 15 mins)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET || 'dev-jwt-secret',
    { expiresIn: '15m' }
  );
};

// Helper to generate refresh token (expires in 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
    { expiresIn: '7d' }
  );
};

/**
 * Controller for User Authentication
 */
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.' });
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa.' });
    }

    // Verify password hash
    // Flask's default werkzeug pbkdf2:sha256 or bcrypt
    let isMatch = false;
    
    // Werkzeug hashes might be: pbkdf2:sha256:600000$salt$hash or scrypt:32768:8:1$salt$hash
    // Flask-Bcrypt hashes start with $2b$ or $2a$
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2y$')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      // If it's PBKDF2 (from Werkzeug), we can support it or write a simple compat checker.
      // In python, werkzeug uses pbkdf2:sha256. If so, let's write a notice.
      // For now, let's assume it's standard bcrypt or we can falls back.
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    // fallback: if Werkzeug PBKDF2 is used, we might need a node pbkdf2 library or custom hashing comparison.
    // Let's implement support for pbkdf2 if the hash structure matches pbkdf2:sha256
    if (!isMatch && user.password_hash.includes('pbkdf2:sha256')) {
      const crypto = require('crypto');
      const parts = user.password_hash.split('$');
      if (parts.length === 3) {
        const [methodAndIterations, salt, hash] = parts;
        const iterations = parseInt(methodAndIterations.split(':')[2]) || 260000;
        const keylen = 32; // standard 32 bytes
        const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha256');
        isMatch = derivedKey.toString('hex') === hash;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: 'Đăng nhập thành công.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.' });
  }
};

/**
 * Controller to Refresh Access Token
 */
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Refresh Token là bắt buộc.' });
  }

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc đã hết hạn.' });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.is_active) {
        return res.status(403).json({ message: 'Tài khoản không hợp lệ hoặc đã bị khóa.' });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi làm mới token.' });
  }
};

/**
 * Controller to Get Profile of Current User
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
    }

    res.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin cá nhân.' });
  }
};

module.exports = {
  login,
  refreshToken,
  getProfile
};
