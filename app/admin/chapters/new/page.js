'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

export default function NewChapterPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    learningOutcomes: [''],
    isActive: true,
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subject, setSubject] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const subjectId = searchParams.get('subject');
  
  useEffect(() => {
    if (subjectId) {
      setFormData(prev => ({ ...prev, subject: subjectId }));
      fetchSubject(subjectId);
    }
  }, [subjectId]);
  
  const fetchSubject = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subjects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subject details');
      }
      
      const data = await response.json();
      setSubject(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleOutcomeChange = (index, value) => {
    const updatedOutcomes = [...formData.learningOutcomes];
    updatedOutcomes[index] = value;
    setFormData(prev => ({
      ...prev,
      learningOutcomes: updatedOutcomes
    }));
  };
  
  const addOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }));
  };
  
  const removeOutcome = (index) => {
    const updatedOutcomes = [...formData.learningOutcomes];
    updatedOutcomes.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      learningOutcomes: updatedOutcomes.length ? updatedOutcomes : ['']
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Filter out empty learning outcomes
    const filteredOutcomes = formData.learningOutcomes.filter(outcome => outcome.trim() !== '');
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          learningOutcomes: filteredOutcomes
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create chapter');
      }
      
      setSuccess('Chapter created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        learningOutcomes: [''],
        isActive: true,
        subject: subjectId
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/admin/chapters?subject=${subjectId}`);
      }, 1500);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Chapter</h1>
        <Link
          href={`/admin/chapters?subject=${subjectId}`}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back to Chapters
        </Link>
      </div>
      
      {subject && (
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h2 className="font-medium text-blue-700">Subject: {subject.name} ({subject.code})</h2>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Chapter Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter chapter title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter chapter description"
            rows={4}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Learning Outcomes
          </label>
          {formData.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleOutcomeChange(index, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder={`Learning outcome #${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOutcome(index)}
                className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOutcome}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Outcome
          </button>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Active Chapter</span>
          </label>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Chapter'}
          </button>
        </div>
      </form>
    </div>
  );
} 