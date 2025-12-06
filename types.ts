export enum Screen {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  job?: string;
  goal?: string;
  averageIncome?: number;
  joinedDate: string;
  profilePicture?: string;
}

export interface LabourLaw {
  title: string;
  year: string;
  keyFeatures: string[];
  applicability: string;
  provisions: string[];
}

export type EmergencyContact = {
  name: string;
  number: string;
  icon: string;
};