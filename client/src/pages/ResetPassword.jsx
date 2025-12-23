import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';
import './ForgotPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token,
                newPassword: password
            });

            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <div className="forgot-password-header">
                    <h1>🔑 Reset Password</h1>
                    <p>Enter your new password below.</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {token && !message && (
                    <form onSubmit={handleSubmit} className="forgot-password-form">
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="forgot-password-footer">
                    <Link to="/login" className="back-link">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
