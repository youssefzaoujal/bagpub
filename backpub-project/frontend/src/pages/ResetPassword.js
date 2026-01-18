// pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react';
import { passwordAPI } from '../services/api';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await passwordAPI.validateResetToken(token);
      if (response.data.valid) {
        setTokenValid(true);
        setEmail(response.data.full_email);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Lien de réinitialisation invalide ou expiré.');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    try {
      await passwordAPI.resetPassword(
        token,
        formData.new_password,
        formData.confirm_password
      );

      setSuccess('Votre mot de passe a été réinitialisé avec succès !');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (!password) return { score: 0, label: 'Faible', color: 'text-red-500' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengths = [
      { label: 'Très faible', color: 'text-red-500' },
      { label: 'Faible', color: 'text-orange-500' },
      { label: 'Moyen', color: 'text-yellow-500' },
      { label: 'Fort', color: 'text-green-500' },
      { label: 'Très fort', color: 'text-emerald-500' }
    ];
    
    return strengths[Math.min(score, 4)];
  };

  const strength = passwordStrength(formData.new_password);

  if (validating) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center'
    },
      React.createElement('div', { className: 'text-center' },
        React.createElement(Loader2, {
          className: 'w-12 h-12 animate-spin text-blue-600 mx-auto'
        }),
        React.createElement('p', {
          className: 'mt-4 text-slate-600'
        }, 'Vérification du lien de sécurité...')
      )
    );
  }

  if (!tokenValid) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6'
    },
      React.createElement('div', {
        className: 'w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center'
      },
        React.createElement(AlertCircle, {
          className: 'w-16 h-16 text-red-500 mx-auto mb-4'
        }),
        React.createElement('h2', {
          className: 'text-2xl font-bold text-slate-900 mb-2'
        }, 'Lien invalide'),
        React.createElement('p', {
          className: 'text-slate-600 mb-6'
        }, error),
        React.createElement(Link, {
          to: '/forgot-password',
          className: 'inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
        }, 'Nouvelle demande')
      )
    );
  }

  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 font-sans p-6'
  },
    // Background
    React.createElement('div', {
      className: 'fixed inset-0 pointer-events-none z-0'
    },
      React.createElement('div', {
        className: 'absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-100/40 rounded-full blur-[120px]'
      })
    ),

    React.createElement(motion.div, {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      className: 'w-full max-w-md relative z-10'
    },
      // Card
      React.createElement('div', {
        className: 'bg-white/80 backdrop-blur-2xl border border-white/80 p-8 rounded-[2rem] shadow-2xl shadow-slate-300/30'
      },
        // Header
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('div', {
            className: 'inline-flex p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 mb-4'
          },
            React.createElement(Shield, { className: 'w-8 h-8 text-emerald-600' })
          ),
          React.createElement('h2', {
            className: 'text-3xl font-extrabold text-slate-900 mb-2'
          }, 'Nouveau mot de passe'),
          React.createElement('p', {
            className: 'text-slate-500 font-medium'
          },
            'Pour : ',
            React.createElement('span', {
              className: 'font-bold text-slate-700'
            }, email)
          )
        ),

        success ? React.createElement('div', {
          className: 'text-center space-y-6'
        },
          React.createElement('div', {
            className: 'inline-flex p-6 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          },
            React.createElement(CheckCircle, { className: 'w-12 h-12 text-green-600' })
          ),
          
          React.createElement('div', null,
            React.createElement('h3', {
              className: 'text-xl font-bold text-slate-800 mb-2'
            }, '✅ Mot de passe modifié !'),
            React.createElement('p', {
              className: 'text-slate-600'
            }, success),
            React.createElement('p', {
              className: 'text-sm text-slate-500 mt-2'
            }, 'Redirection vers la page de connexion...')
          ),
          
          React.createElement(Link, {
            to: '/login',
            className: 'inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
          }, 'Se connecter maintenant →')
        ) : React.createElement('form', {
          onSubmit: handleSubmit,
          className: 'space-y-6'
        },
          // New Password
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('label', {
              className: 'text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
            }, 'Nouveau mot de passe'),
            React.createElement('div', { className: 'relative group' },
              React.createElement('div', {
                className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'
              },
                React.createElement(Lock, {
                  className: 'h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors'
                })
              ),
              React.createElement('input', {
                type: showPassword ? 'text' : 'password',
                name: 'new_password',
                value: formData.new_password,
                onChange: handleChange,
                required: true,
                placeholder: '••••••••',
                className: 'w-full pl-12 pr-12 py-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 hover:bg-white/80 hover:border-gray-300 font-medium shadow-sm'
              }),
              React.createElement('button', {
                type: 'button',
                onClick: () => setShowPassword(!showPassword),
                className: 'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors'
              },
                showPassword ? 
                  React.createElement(EyeOff, { className: 'h-5 w-5' }) : 
                  React.createElement(Eye, { className: 'h-5 w-5' })
              )
            ),
            
            // Password Strength
            formData.new_password && React.createElement('div', { className: 'mt-2' },
              React.createElement('div', {
                className: 'flex items-center justify-between mb-1'
              },
                React.createElement('span', {
                  className: 'text-xs font-medium text-slate-600'
                },
                  'Sécurité : ',
                  React.createElement('span', {
                    className: strength.color
                  }, strength.label)
                ),
                React.createElement('span', {
                  className: 'text-xs text-slate-500'
                }, formData.new_password.length + '/8 caractères')
              ),
              React.createElement('div', {
                className: 'h-1 bg-slate-200 rounded-full overflow-hidden'
              },
                React.createElement('div', {
                  className: 'h-full ' + (
                    strength.score === 0 ? 'bg-red-500 w-1/4' :
                    strength.score === 1 ? 'bg-orange-500 w-2/4' :
                    strength.score === 2 ? 'bg-yellow-500 w-3/4' :
                    'bg-green-500 w-full'
                  )
                })
              )
            )
          ),

          // Confirm Password
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('label', {
              className: 'text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
            }, 'Confirmer le mot de passe'),
            React.createElement('div', { className: 'relative group' },
              React.createElement('div', {
                className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'
              },
                React.createElement(Lock, {
                  className: 'h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors'
                })
              ),
              React.createElement('input', {
                type: showConfirmPassword ? 'text' : 'password',
                name: 'confirm_password',
                value: formData.confirm_password,
                onChange: handleChange,
                required: true,
                placeholder: '••••••••',
                className: 'w-full pl-12 pr-12 py-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 hover:bg-white/80 hover:border-gray-300 font-medium shadow-sm'
              }),
              React.createElement('button', {
                type: 'button',
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className: 'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors'
              },
                showConfirmPassword ? 
                  React.createElement(EyeOff, { className: 'h-5 h-5' }) : 
                  React.createElement(Eye, { className: 'h-5 h-5' })
              )
            )
          ),

          // Requirements
          React.createElement('div', {
            className: 'p-4 bg-gradient-to-r from-slate-50 to-slate-50/80 border border-slate-200 rounded-2xl'
          },
            React.createElement('p', {
              className: 'text-xs font-bold text-slate-700 uppercase mb-2'
            }, '🔒 Exigences de sécurité'),
            React.createElement('ul', {
              className: 'text-xs text-slate-600 space-y-1'
            },
              React.createElement('li', {
                className: 'flex items-center gap-2 ' + 
                  (formData.new_password.length >= 8 ? 'text-green-600' : '')
              },
                React.createElement('div', {
                  className: 'w-1.5 h-1.5 rounded-full ' + 
                    (formData.new_password.length >= 8 ? 'bg-green-500' : 'bg-slate-300')
                }),
                'Minimum 8 caractères'
              ),
              React.createElement('li', {
                className: 'flex items-center gap-2 ' + 
                  (/[A-Z]/.test(formData.new_password) ? 'text-green-600' : '')
              },
                React.createElement('div', {
                  className: 'w-1.5 h-1.5 rounded-full ' + 
                    (/[A-Z]/.test(formData.new_password) ? 'bg-green-500' : 'bg-slate-300')
                }),
                'Au moins une majuscule'
              ),
              React.createElement('li', {
                className: 'flex items-center gap-2 ' + 
                  (/[0-9]/.test(formData.new_password) ? 'text-green-600' : '')
              },
                React.createElement('div', {
                  className: 'w-1.5 h-1.5 rounded-full ' + 
                    (/[0-9]/.test(formData.new_password) ? 'bg-green-500' : 'bg-slate-300')
                }),
                'Au moins un chiffre'
              ),
              React.createElement('li', {
                className: 'flex items-center gap-2 ' + 
                  (/[^A-Za-z0-9]/.test(formData.new_password) ? 'text-green-600' : '')
              },
                React.createElement('div', {
                  className: 'w-1.5 h-1.5 rounded-full ' + 
                    (/[^A-Za-z0-9]/.test(formData.new_password) ? 'bg-green-500' : 'bg-slate-300')
                }),
                'Au moins un caractère spécial'
              )
            )
          ),

          // Error Message
          error && React.createElement('div', {
            className: 'p-4 bg-gradient-to-r from-red-50 to-red-50/80 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3'
          },
            React.createElement(AlertCircle, { className: 'w-5 h-5' }),
            React.createElement('span', null, error)
          ),

          // Submit Button
          React.createElement(motion.button, {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
            type: 'submit',
            disabled: loading,
            className: 'w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2'
          },
            loading ? [
              React.createElement(Loader2, {
                key: 'loader',
                className: 'w-5 h-5 animate-spin'
              }),
              'Réinitialisation...'
            ] : [
              React.createElement(Shield, {
                key: 'shield',
                className: 'w-5 h-5'
              }),
              'Définir le nouveau mot de passe'
            ]
          )
        ),

        // Links
        React.createElement('div', {
          className: 'mt-8 pt-6 border-t border-slate-200'
        },
          React.createElement(Link, {
            to: '/login',
            className: 'flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group font-medium'
          },
            React.createElement(ArrowLeft, {
              className: 'w-4 h-4 group-hover:-translate-x-1 transition-transform'
            }),
            'Retour à la connexion'
          )
        )
      ),

      // Security Note
      React.createElement('div', { className: 'mt-6 text-center' },
        React.createElement('div', {
          className: 'inline-flex items-center gap-2 text-xs text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200'
        },
          React.createElement(Shield, { className: 'w-3 h-3' }),
          React.createElement('span', null, 'Connexion sécurisée • HTTPS • Chiffrement AES-256')
        )
      )
    )
  );
}

export default ResetPassword;