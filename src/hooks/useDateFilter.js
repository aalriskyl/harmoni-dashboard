import { useContext } from 'react';
import { DateFilterContext } from '../context/DateFilterContext';

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};
