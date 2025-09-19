import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowBack, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { signIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wanderer.jpg)',
          zIndex: 1,
          transform: `scale(${Math.max(1, 1.3 - (scrollY - window.innerHeight) * 0.0005)})`,
          transition: 'transform 0.1s ease-out'
        }}
      />
      
      {/* Overlay for text readability */}
      <div className="fixed inset-0 bg-opacity-20" style={{ zIndex: 2 }} />

      {/* Scrollable Content */}
      <div className="relative" style={{ zIndex: 3 }}>

       {/* Navigation */}
			<div className="p-6" style={{ zIndex: 4 }}>
				<Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
					<ArrowBack className="mr-2" />
					Back to Home
				</Link>
			</div>

			<div className="max-w-4xl mx-auto px-6 py-12">
				<div className="min-h-screen"></div>

				<div className="min-h-screen flex flex-col items-center justify-center">
					{/* Login Form */}
					<div className="bg-white rounded-lg shadow-lg p-8 mb-16 max-w-md mx-auto">
						<div className="text-center mb-8">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
							<p className="text-gray-600">Sign in to continue your philosophical journey</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Email Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Email className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full pl-10 pr-3 py-3 shadow-xl rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50"
										placeholder="Enter your email"
										required
									/>
								</div>
							</div>

							{/* Password Field */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full pl-10 pr-10 py-3 shadow-xl rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50"
										placeholder="Enter your password"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showPassword ? (
											<VisibilityOff className="h-5 w-5 text-gray-400" />
										) : (
											<Visibility className="h-5 w-5 text-gray-400" />
										)}
									</button>
								</div>
							</div>

							{/* Forgot Password */}
							<div className="text-right">
								<button 
									type="button"
									className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
									onClick={() => {
										// TODO: Implement forgot password functionality
										console.log('Forgot password clicked');
									}}
								>
									Forgot your password?
								</button>
							</div>

							{/* Sign In Button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-gray-900 text-white backdrop-blur-xs  py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? 'Signing in...' : 'Sign In'}
							</button>

							{/* Google Sign In Button */}
							<button
								type="button"
								onClick={handleGoogleSignIn}
								disabled={loading}
								className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
							>
								<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
								</svg>
								Continue with Google
							</button>

							{/* Register Button */}
							<Link
								to="/register"
								className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-200 transition-colors flex items-center justify-center"
							>
								Create New Account
							</Link>
						</form>

						{/* Sign Up Link */}
						<div className="mt-6 text-center">
							<p className="text-gray-600">
								Don't have an account?{' '}
								<Link to="/register" className="text-gray-900 font-medium hover:underline">
									Sign up for free
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		</div>
  );
};

export default LoginPage;
