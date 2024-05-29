import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { App } from '/imports/ui/App';

Meteor.startup(() => {
  Meteor.subscribe('tasks');
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  
  try {
    root.render(<App />);
  } catch (error) {
    console.error('Error rendering App:', error);
  }
});

export const formatDateAndTime = (date) => {
  const formattedDate = date.toLocaleDateString('en-US');
  const formattedTime = date.toLocaleTimeString('en-US');
  return `${formattedDate} ${formattedTime}`;
};