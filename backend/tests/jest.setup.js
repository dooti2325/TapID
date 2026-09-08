// Set NODE_ENV to test for all test runs
process.env.NODE_ENV = 'test';
// Use a predictable JWT secret for testing
process.env.JWT_SECRET = process.env.JWT_SECRET || 'tapid-test-secret-key-minimum-32chars';
