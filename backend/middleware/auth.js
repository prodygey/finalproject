
// Purpose: Import the library that verifies JWT login tokens.
const jwt = require('jsonwebtoken');

// Purpose: Reject requests without a valid authentication token.
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Purpose: Require the standard Bearer token format.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Purpose: Verify the token signature and expiration.
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // Purpose: Continue to the protected route.
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
}

// Purpose: Restrict selected endpoints to administrator accounts.
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Administrator access required.',
    });
  }

  next();
}

// Purpose: Export the middleware for use in API routes.
module.exports = { authenticateToken, requireAdmin };
