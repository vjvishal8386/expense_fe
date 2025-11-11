import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Register = () => {
  // Get invitation token from URL
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  
  // Step management
  const [step, setStep] = useState<'register' | 'verify'>('register');
  
  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState<string>('');
  
  // UI state
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Show invitation message if present
  useEffect(() => {
    if (invitationToken) {
      setMessage('You\'ve been invited! Complete registration to connect with your friend.');
    }
  }, [invitationToken]);

  // Handle registration (Step 1)
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await register(email, password, name || undefined, invitationToken || undefined);
      
      // Save user_id for OTP verification
      setUserId(response.user_id);
      
      if (invitationToken) {
        setMessage('Registration successful! Check your email for the 6-digit OTP code. You\'ll be automatically connected with your friend after verification!');
      } else {
        setMessage('Registration successful! Check your email for the 6-digit OTP code.');
      }
      
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification (Step 2)
  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!userId) {
      setError('User ID not found. Please register again.');
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      await verifyOTP(userId, otp);
      setMessage('Email verified successfully! Redirecting to dashboard...');
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!userId || !email) {
      setError('Cannot resend OTP. Please register again.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resendOTP(userId, email);
      setMessage('OTP has been resent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Form (Step 1)
  if (step === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Spend Book
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {invitationToken ? 'Join via Invitation' : 'Create your account'}
          </p>
          {invitationToken && (
            <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm text-center">
              🎉 You've been invited! Complete registration to connect with your friend.
            </div>
          )}
        </div>
          
          <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {message}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name (optional)
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min. 8 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // OTP Verification Form (Step 2)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleVerifyOTP}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
              placeholder="123456"
            />
            <p className="mt-2 text-xs text-gray-500">
              Check your email inbox (or spam folder) for the OTP code
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep('register');
                setOtp('');
                setError('');
                setMessage('');
              }}
              className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
