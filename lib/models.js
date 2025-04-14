import mongoose from 'mongoose';
import Subject from '@/models/Subject';
import Content from '@/models/Content';
import Department from '@/models/Department';
import User from '@/models/User';

// This function ensures all models are registered
export function registerModels() {
  // Register models if they haven't been registered yet
  if (!mongoose.models.Subject) {
    Subject;
  }
  if (!mongoose.models.Content) {
    Content;
  }
  if (!mongoose.models.Department) {
    Department;
  }
  if (!mongoose.models.User) {
    User;
  }
}

export { Subject, Content, Department, User }; 