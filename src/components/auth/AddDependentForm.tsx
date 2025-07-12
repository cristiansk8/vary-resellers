'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AddDependentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    relationship: '',
    documentId: '',
    birthDate: '',
    country: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [loginInfo, setLoginInfo] = useState<{
    email: string;
    documentId: string;
    tempPassword: string;
  } | null>(null);

  const relationships = [
    'Hijo/Hija',
    'Cónyuge', 
    'Padre/Madre',
    'Hermano/Hermana',
    'Otro familiar',
  ];

  const countries = [
    'Colombia',
    'México',
    'Argentina',
    'Chile',
    'Perú'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowLoginInfo(false);
    setLoginInfo(null);
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.relationship || !formData.documentId || !formData.birthDate || !formData.country) {
      alert('Por favor completa todos los campos incluyendo el email');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🚀 Enviando datos al endpoint REAL:', formData);

      const res = await fetch('/api/dependent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      console.log('📡 Status de respuesta:', res.status);
      
      const data = await res.json();
      console.log('📦 Respuesta del servidor:', data);
      
      if (data.success) {
        setLoginInfo(data.loginInfo);
        setShowLoginInfo(true);
        
        // Limpiar formulario
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          relationship: '',
          documentId: '',
          birthDate: '',
          country: '',
        });
      } else {
        alert(data.error || 'Error al crear dependiente');
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      alert('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'}}>
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/dashboard">
          <button className="mb-4 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50">
            ← Volver al Dashboard
          </button>
        </Link>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="bg-gray-50 p-6 rounded-t-xl mb-6">
            <h1 className="text-2xl font-bold text-blue-800 flex items-center">
              ✨ Crear Dependiente Real
            </h1>
          </div>

          <div className="bg-green-100 p-4 rounded-lg mb-6 border border-green-300">
            <p className="text-green-800 font-medium">
              ✨ <strong>MODO REAL ACTIVADO</strong> - Guardando en Supabase
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Nombre *
                </label>
                <input 
                  type="text"
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Apellido *
                </label>
                <input 
                  type="text"
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* CAMPO DE EMAIL MUY VISIBLE */}
            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
              <label className="block text-lg font-bold text-gray-700 mb-2 flex items-center">
                📧 EMAIL DEL DEPENDIENTE *
              </label>
              <input 
                type="email"
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="dependiente@ejemplo.com"
                className="w-full h-12 px-3 text-lg border-2 border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-sm text-yellow-700 mt-2 font-medium">
                💡 El dependiente usará este email para login y recuperar contraseña
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Relación *
              </label>
              <select 
                name="relationship" 
                value={formData.relationship} 
                onChange={handleChange} 
                required
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar relación</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌍 País *
                </label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange} 
                  required
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar país</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🆔 Documento *
                </label>
                <input 
                  type="text"
                  name="documentId" 
                  value={formData.documentId} 
                  onChange={handleChange} 
                  required 
                  className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Fecha de nacimiento *
              </label>
              <input 
                type="date"
                name="birthDate" 
                value={formData.birthDate} 
                onChange={handleChange} 
                required 
                className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {showLoginInfo && loginInfo && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-800 font-semibold text-sm">✅ ¡Dependiente creado en Supabase!</p>
                <p className="text-green-700 text-xs mt-1">
                  📧 Email: <span className="font-bold">{loginInfo.email}</span>
                </p>
                <p className="text-green-700 text-xs">
                  🔑 Contraseña temporal: <span className="font-bold">{loginInfo.tempPassword}</span>
                </p>
                <p className="text-green-700 text-xs mt-2">
                  💡 Revisa Supabase Auth y la tabla de dependientes
                </p>
                <div className="mt-3">
                  <Link href="/dashboard/manage-dependents">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                      Ver lista de dependientes
                    </button>
                  </Link>
                </div>
              </div>
            )}
            
            {!showLoginInfo && (
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 text-lg rounded-md disabled:opacity-50"
              >
                {loading ? '⏳ Creando en Supabase...' : '✨ CREAR DEPENDIENTE REAL'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}