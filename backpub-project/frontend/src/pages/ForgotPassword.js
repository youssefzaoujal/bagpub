// pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, Loader2, Shield, Lock, AlertCircle } from 'lucide-react';
import { passwordAPI } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await passwordAPI.forgotPassword(email);
      setSuccess('Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 font-sans p-6'
  },
    // Background FX
    React.createElement('div', {
      className: 'fixed inset-0 pointer-events-none z-0'
    },
      React.createElement('div', {
        className: 'absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-100/40 rounded-full blur-[120px]'
      }),
      React.createElement('div', {
        className: 'absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-100/40 rounded-full blur-[120px]'
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
            className: 'inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-4'
          },
            React.createElement(Shield, { className: 'w-8 h-8 text-blue-600' })
          ),
          React.createElement('h2', {
            className: 'text-3xl font-extrabold text-slate-900 mb-2'
          }, step === 1 ? 'Mot de passe oublié' : 'Email envoyé'),
          React.createElement('p', {
            className: 'text-slate-500 font-medium'
          }, step === 1 
            ? 'Entrez votre email pour recevoir un lien de réinitialisation'
            : 'Vérifiez votre boîte email'
          )
        ),

        step === 1 ? React.createElement('form', {
          onSubmit: handleSubmit,
          className: 'space-y-6'
        },
          // Email Input
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('label', {
              className: 'text-xs font-bold text-slate-600 uppercase tracking-widest ml-1'
            }, 'Adresse email'),
            React.createElement('div', { className: 'relative group' },
              React.createElement('div', {
                className: 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'
              },
                React.createElement(Mail, { className: 'h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors' })
              ),
              React.createElement('input', {
                type: 'email',
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                placeholder: 'votre@email.com',
                className: 'w-full pl-12 pr-4 py-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl text-slate-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 hover:bg-white/80 hover:border-gray-300 font-medium shadow-sm'
              })
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
            className: 'w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2'
          },
            loading ? [
              React.createElement(Loader2, {
                key: 'loader',
                className: 'w-5 h-5 animate-spin'
              }),
              'Envoi en cours...'
            ] : [
              React.createElement(Mail, {
                key: 'mail',
                className: 'w-5 h-5'
              }),
              'Envoyer le lien'
            ]
          )
        ) : React.createElement('div', {
          className: 'space-y-6 text-center'
        },
          React.createElement('div', {
            className: 'inline-flex p-6 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          },
            React.createElement(CheckCircle, { className: 'w-12 h-12 text-green-600' })
          ),
          
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('h3', {
              className: 'text-xl font-bold text-slate-800'
            }, '✅ Email envoyé avec succès'),
            
            React.createElement('div', {
              className: 'p-4 bg-gradient-to-r from-green-50 to-green-50/80 border border-green-200 rounded-2xl text-green-700 text-sm'
            },
              React.createElement('p', null, success)
            ),
            
            React.createElement('div', {
              className: 'p-4 bg-gradient-to-r from-blue-50 to-blue-50/80 border border-blue-200 rounded-2xl text-sm'
            },
              React.createElement('p', {
                className: 'font-bold text-slate-700 mb-2'
              }, '📋 À faire :'),
              React.createElement('ul', {
                className: 'text-left space-y-2 text-slate-600'
              },
                React.createElement('li', {
                  className: 'flex items-center gap-2'
                },
                  React.createElement('div', {
                    className: 'w-2 h-2 bg-blue-500 rounded-full'
                  }),
                  React.createElement('span', null, 'Vérifiez votre boîte de réception')
                ),
                React.createElement('li', {
                  className: 'flex items-center gap-2'
                },
                  React.createElement('div', {
                    className: 'w-2 h-2 bg-blue-500 rounded-full'
                  }),
                  React.createElement('span', null, 'Cliquez sur le lien dans l\'email')
                ),
                React.createElement('li', {
                  className: 'flex items-center gap-2'
                },
                  React.createElement('div', {
                    className: 'w-2 h-2 bg-blue-500 rounded-full'
                  }),
                  React.createElement('span', null, 'Créez un nouveau mot de passe sécurisé')
                )
              )
            )
          ),

          React.createElement('div', { className: 'space-y-4 pt-4' },
            React.createElement('button', {
              onClick: () => setStep(1),
              className: 'text-blue-600 hover:text-blue-700 font-medium text-sm'
            }, '↻ Réessayer avec un autre email'),
            
            React.createElement('div', { className: 'text-xs text-slate-500' },
              React.createElement('p', null, 'Vous ne recevez pas l\'email ?'),
              React.createElement('ul', { className: 'mt-1' },
                React.createElement('li', null, '• Vérifiez vos spams/courriers indésirables'),
                React.createElement('li', null, '• Assurez-vous d\'avoir saisi le bon email'),
                React.createElement('li', null, '• Attendez quelques minutes')
              )
            )
          )
        ),

        // Links
        React.createElement('div', {
          className: 'mt-8 pt-6 border-t border-slate-200'
        },
          React.createElement('div', {
            className: 'flex justify-between items-center'
          },
            React.createElement(Link, {
              to: '/login',
              className: 'flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group font-medium'
            },
              React.createElement(ArrowLeft, {
                className: 'w-4 h-4 group-hover:-translate-x-1 transition-transform'
              }),
              'Retour à la connexion'
            ),
            
            step === 1 && React.createElement(Link, {
              to: '/register/client',
              className: 'text-sm text-blue-600 hover:text-blue-700 font-medium'
            }, 'Créer un compte')
          )
        )
      ),

      // Security Note
      React.createElement('div', { className: 'mt-6 text-center' },
        React.createElement('div', {
          className: 'inline-flex items-center gap-2 text-xs text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200'
        },
          React.createElement(Lock, { className: 'w-3 h-3' }),
          React.createElement('span', null, 'Communication sécurisée • SSL/TLS • Données chiffrées')
        )
      )
    )
  );
}

export default ForgotPassword;