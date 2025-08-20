import React, { useState } from 'react';
import { DateFilterContext } from './DateFilterContext';

export const DateFilterProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  return (
    <DateFilterContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateFilterContext.Provider>
  );
};
